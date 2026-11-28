param(
  [string]$SourcePath = 'C:\Users\User\Downloads\Telegram Desktop\Untitled.docx',
  [string]$RepositoryPath = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$outputPath = Join-Path $RepositoryPath 'output/blog-source'
$contentPath = Join-Path $RepositoryPath 'src/content/resources/client-articles-source.json'
[IO.Directory]::CreateDirectory($outputPath) | Out-Null
$utf8 = [Text.UTF8Encoding]::new($false)
$sourceHash = (Get-FileHash -LiteralPath $SourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
$archive = [IO.Compression.ZipFile]::OpenRead($SourcePath)
try {
  $parts = @{}
  $partManifest = @()
  foreach ($entry in $archive.Entries) {
    $reader = [IO.StreamReader]::new($entry.Open())
    try { $text = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $parts[$entry.FullName] = $text
    $partManifest += [ordered]@{ name = $entry.FullName; bytes = $entry.Length }
    $safeName = $entry.FullName.Replace('/', '__')
    [IO.File]::WriteAllText((Join-Path $outputPath $safeName), $text, $utf8)
  }
} finally { $archive.Dispose() }
$document = [xml]$parts['word/document.xml']
$script:ns = [Xml.XmlNamespaceManager]::new($document.NameTable)
$script:w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$script:ns.AddNamespace('w', $script:w)
$script:ns.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
$script:relationships = @{}
$rels = [xml]$parts['word/_rels/document.xml.rels']
foreach ($rel in $rels.DocumentElement.ChildNodes) { $script:relationships[$rel.Id] = $rel.Target }
$script:numbering = [xml]$parts['word/numbering.xml']

function Get-WValue($node, [string]$xpath) {
  $item = $node.SelectSingleNode($xpath, $script:ns)
  if ($null -ne $item) { return $item.GetAttribute('val', $script:w) }
  return $null
}
function Get-SourceText($node) {
  $result = [Text.StringBuilder]::new()
  foreach ($item in $node.SelectNodes('.//w:t | .//w:tab | .//w:br | .//w:cr', $script:ns)) {
    switch ($item.LocalName) {
      't' { [void]$result.Append($item.InnerText) }
      'tab' { [void]$result.Append("`t") }
      default { [void]$result.Append("`n") }
    }
  }
  return $result.ToString()
}
function Get-Runs($node) {
  $runs = @()
  foreach ($run in $node.SelectNodes('.//w:r', $script:ns)) {
    $item = [ordered]@{
      text = Get-SourceText $run
      bold = ($null -ne $run.SelectSingleNode('w:rPr/w:b', $script:ns))
      italic = ($null -ne $run.SelectSingleNode('w:rPr/w:i', $script:ns))
      underline = ($null -ne $run.SelectSingleNode('w:rPr/w:u', $script:ns))
    }
    if ($run.ParentNode.LocalName -eq 'hyperlink') {
      $relationshipId = $run.ParentNode.GetAttribute('id', $script:ns.LookupNamespace('r'))
      if ($script:relationships.ContainsKey($relationshipId)) { $item.href = $script:relationships[$relationshipId] }
      else { $item.href = '#' + $run.ParentNode.GetAttribute('anchor', $script:w) }
    }
    $runs += $item
  }
  return $runs
}
function Get-Paragraph($node, [int]$sourceIndex) {
  $style = Get-WValue $node 'w:pPr/w:pStyle'
  $type = 'paragraph'
  if ($style -match '^Heading([1-6])$') { $type = 'heading' }
  elseif ($style -eq 'Quote') { $type = 'quote' }
  elseif ($style -eq 'ListParagraph') { $type = 'list-item' }
  $item = [ordered]@{ type = $type; sourceIndex = $sourceIndex; style = $style; text = Get-SourceText $node; runs = @(Get-Runs $node) }
  if ($type -eq 'heading') { $item.level = [int]$style.Substring(7) }
  $numId = Get-WValue $node 'w:pPr/w:numPr/w:numId'
  if ($null -ne $numId) {
    $level = Get-WValue $node 'w:pPr/w:numPr/w:ilvl'
    $abstractId = Get-WValue $script:numbering "//w:num[@w:numId='$numId']/w:abstractNumId"
    $definition = $script:numbering.SelectSingleNode("//w:abstractNum[@w:abstractNumId='$abstractId']/w:lvl[@w:ilvl='$level']", $script:ns)
    $item.list = [ordered]@{ numId = $numId; level = [int]$level; format = Get-WValue $definition 'w:numFmt'; start = [int](Get-WValue $definition 'w:start'); marker = Get-WValue $definition 'w:lvlText' }
  }
  return $item
}
function Get-Table($node, [int]$sourceIndex) {
  $rows = @()
  foreach ($row in $node.SelectNodes('w:tr', $script:ns)) {
    $cells = @()
    foreach ($cell in $row.SelectNodes('w:tc', $script:ns)) {
      $paragraphs = @($cell.SelectNodes('w:p', $script:ns) | ForEach-Object { Get-Paragraph $_ $sourceIndex })
      $span = Get-WValue $cell 'w:tcPr/w:gridSpan'
      $cells += [ordered]@{ text = ($paragraphs.text -join "`n"); blocks = $paragraphs; colSpan = $(if ($span) { [int]$span } else { 1 }) }
    }
    $rows += [ordered]@{ cells = $cells }
  }
  return [ordered]@{ type = 'table'; sourceIndex = $sourceIndex; rows = $rows }
}
function Get-BodyPlainText($blocks) {
  $texts = foreach ($block in $blocks) {
    if ($block.type -eq 'table') {
      $rowTexts = foreach ($row in $block.rows) { $row.cells.text -join "`t" }
      $rowTexts -join "`n"
    } else { $block.text }
  }
  return $texts -join "`n`n"
}
$nodes = @($document.SelectSingleNode('//w:body', $script:ns).ChildNodes)
$sourceBlocks = @()
for ($i = 0; $i -lt $nodes.Count; $i++) {
  $node = $nodes[$i]
  if ($node.LocalName -eq 'p') { $block = Get-Paragraph $node $i }
  elseif ($node.LocalName -eq 'tbl') { $block = Get-Table $node $i }
  else { $block = [ordered]@{ type = $node.LocalName; sourceIndex = $i } }
  $sourceBlocks += $block
}
$markers = @($sourceBlocks | Where-Object { $_.type -eq 'heading' -and $_.text -match '^Article ([0-9]+): ' })
$expectedSlugs = @('furnace-not-heating', 'refrigerator-not-cooling', 'commercial-refrigerator-not-cooling', 'washer-not-draining', 'dryer-not-heating', 'dishwasher-not-draining', 'oven-not-heating', 'ice-maker-not-working', 'walk-in-cooler-not-cooling', 'commercial-ice-machine-cleaning', 'commercial-oven-not-heating', 'commercial-freezer-not-freezing', 'ice-machine-not-making-ice')
if ($markers.Count -ne 13) { throw "Expected 13 articles; found $($markers.Count)." }
$articles = @()
for ($i = 0; $i -lt $markers.Count; $i++) {
  $start = $markers[$i].sourceIndex
  $end = if ($i -lt $markers.Count - 1) { $markers[$i + 1].sourceIndex - 2 } else { $nodes.Count - 2 }
  $metadata = $sourceBlocks[$start + 1]
  if ($metadata.type -ne 'table') { throw "Article $($i + 1) has no metadata table." }
  $fields = @{}
  foreach ($row in $metadata.rows) { if ($row.cells.Count -eq 2) { $fields[$row.cells[0].text] = $row.cells[1].text } }
  $title = $sourceBlocks[$start + 2]
  if ($title.type -ne 'heading' -or $title.level -ne 1) { throw "Article $($i + 1) has no H1." }
  $slug = $fields['URL slug'] -replace '^/blog/', ''
  if ($slug -ne $expectedSlugs[$i]) { throw "Unexpected source slug $slug at Article $($i + 1)." }
  $body = @($sourceBlocks[($start + 3)..$end])
  $bodyPlainText = Get-BodyPlainText $body
  $faqHeading = @($body | Where-Object { $_.type -eq 'heading' -and $_.text -eq 'Frequently asked questions' })
  $faqCount = 0
  if ($faqHeading.Count -eq 1) {
    foreach ($block in $body) {
      if ($block.sourceIndex -le $faqHeading[0].sourceIndex) { continue }
      if ($block.type -eq 'heading') { break }
      $faqCount++
    }
  }
  $articles += [ordered]@{
    number = $i + 1
    slug = $slug
    urlSlug = $fields['URL slug']
    seoTitle = $fields['SEO title']
    title = $title.text
    titleRuns = $title.runs
    metaDescription = $fields['Meta description']
    keywordsText = $fields['Main keywords']
    keywords = @($fields['Main keywords'] -split ', ')
    metadataRows = $metadata.rows
    sourceRange = [ordered]@{ marker = $start; metadata = $start + 1; title = $start + 2; firstBody = $start + 3; lastBody = $end }
    bodyPlainText = $bodyPlainText
    counts = [ordered]@{
      words = @([regex]::Matches($bodyPlainText, '\S+')).Count
      characters = $bodyPlainText.Length
      blocks = $body.Count
      tables = @($body | Where-Object { $_.type -eq 'table' }).Count
      faq = $faqCount
      hyperlinks = @($body | ForEach-Object { $_.runs } | Where-Object { $_.href }).Count
    }
    blocks = $body
  }
}
$provenance = [ordered]@{
  sourceFile = [IO.Path]::GetFileName($SourcePath)
  sha256 = $sourceHash
  bytes = (Get-Item -LiteralPath $SourcePath).Length
  documentDateText = $sourceBlocks[2].text
  articleCount = $articles.Count
  paragraphCount = @($sourceBlocks | Where-Object { $_.Contains('text') }).Count
  tableCount = @($sourceBlocks | Where-Object { $_.type -eq 'table' }).Count
  embeddedMediaCount = @($partManifest | Where-Object { $_.name -like 'word/media/*' }).Count
  preservation = 'Original wording, run emphasis, hyperlinks, heading levels, numbering definitions and table cells retained. Document intro, article markers, metadata tables and tab labels retained in intermediate; metadata and H1 are separate fields in article JSON.'
}
$result = [ordered]@{ schemaVersion = 1; provenance = $provenance; articles = $articles }
$intermediate = [ordered]@{ provenance = $provenance; archiveParts = $partManifest; relationships = $script:relationships; blocks = $sourceBlocks }
[IO.File]::WriteAllText($contentPath, ($result | ConvertTo-Json -Depth 60), $utf8)
[IO.File]::WriteAllText((Join-Path $outputPath 'source-structure.json'), ($intermediate | ConvertTo-Json -Depth 60), $utf8)
$plainLines = foreach ($block in $sourceBlocks) {
  if ($block.type -eq 'table') {
    '[TABLE ' + $block.sourceIndex + ']'
    foreach ($row in $block.rows) { ($row.cells.text -join ' | ') }
  } elseif ($block.Contains('text')) { '[' + $block.sourceIndex + '] ' + $block.text }
}
[IO.File]::WriteAllLines((Join-Path $outputPath 'source-transcript.txt'), [string[]]$plainLines, $utf8)
# Re-open the generated JSON and compare every paragraph/run and table cell with
# the corresponding source XML text nodes. This also rejects nested run arrays.
$reloaded = Get-Content -LiteralPath $contentPath -Raw -Encoding UTF8 | ConvertFrom-Json
$validationArticles = @()
foreach ($article in $reloaded.articles) {
  foreach ($block in $article.blocks) {
    $xmlNode = $nodes[$block.sourceIndex]
    if ($block.type -eq 'table') {
      $sourceCells = @($xmlNode.SelectNodes('w:tr/w:tc', $script:ns))
      $outputCells = @($block.rows | ForEach-Object { $_.cells })
      if ($sourceCells.Count -ne $outputCells.Count) { throw "Table cell count mismatch for $($article.slug)." }
      for ($cellIndex = 0; $cellIndex -lt $sourceCells.Count; $cellIndex++) {
        $sourceParagraphs = @($sourceCells[$cellIndex].SelectNodes('w:p', $script:ns))
        $outputParagraphs = @($outputCells[$cellIndex].blocks)
        if ($sourceParagraphs.Count -ne $outputParagraphs.Count) { throw "Table paragraph count mismatch for $($article.slug)." }
        for ($paragraphIndex = 0; $paragraphIndex -lt $sourceParagraphs.Count; $paragraphIndex++) {
          $expected = ($sourceParagraphs[$paragraphIndex].SelectNodes('.//w:t', $script:ns) | ForEach-Object { $_.InnerText }) -join ''
          if ($expected -cne $outputParagraphs[$paragraphIndex].text -or $expected -cne ($outputParagraphs[$paragraphIndex].runs.text -join '')) { throw "Table text mismatch for $($article.slug)." }
        }
      }
    } else {
      $expected = ($xmlNode.SelectNodes('.//w:t', $script:ns) | ForEach-Object { $_.InnerText }) -join ''
      if ($expected -cne $block.text -or $expected -cne ($block.runs.text -join '')) { throw "Paragraph text mismatch for $($article.slug) at $($block.sourceIndex)." }
      if (@($block.runs | Where-Object { $_ -is [array] }).Count -gt 0) { throw 'Nested runs detected.' }
    }
  }
  if ((Get-BodyPlainText $article.blocks) -cne $article.bodyPlainText) { throw "Plain text mismatch for $($article.slug)." }
  $validationArticles += [ordered]@{ slug = $article.slug; exactXmlTextMatch = $true; counts = $article.counts }
}
[IO.File]::WriteAllText((Join-Path $outputPath 'extraction-validation.json'), ([ordered]@{ sourceSha256 = $sourceHash; articleCount = 13; exactXmlTextMatch = $true; articles = $validationArticles } | ConvertTo-Json -Depth 20), $utf8)
if ((Get-FileHash -LiteralPath $SourcePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $sourceHash) { throw 'Source file changed during extraction.' }
$articles | ForEach-Object { [pscustomobject]@{ number = $_.number; slug = $_.slug; bodyBlocks = $_.blocks.Count; tables = @($_.blocks | Where-Object { $_.type -eq 'table' }).Count } } | Format-Table
Write-Output ('Source SHA256: ' + $sourceHash)
