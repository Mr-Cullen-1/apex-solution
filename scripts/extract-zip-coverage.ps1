param(
  [Parameter(Mandatory = $true)][string]$WorkbookPath,
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
if (-not $OutputPath) { $OutputPath = Join-Path $PSScriptRoot '../src/content/service-coverage-data.json' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$sourceHash = (Get-FileHash -LiteralPath $WorkbookPath -Algorithm SHA256).Hash.ToLowerInvariant()
$archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $WorkbookPath))

function Read-WorkbookXml([string]$EntryName) {
  $entry = $archive.GetEntry($EntryName)
  if (-not $entry) { throw "Missing workbook entry: $EntryName" }
  $reader = [IO.StreamReader]::new($entry.Open())
  try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}

try {
  $workbook = Read-WorkbookXml 'xl/workbook.xml'
  $relationships = Read-WorkbookXml 'xl/_rels/workbook.xml.rels'
  $strings = @()
  if ($archive.GetEntry('xl/sharedStrings.xml')) {
    $shared = Read-WorkbookXml 'xl/sharedStrings.xml'
    $strings = @($shared.sst.si | ForEach-Object { $_.InnerText })
  }

  function Read-Sheet([string]$Name) {
    $sheet = $workbook.workbook.sheets.sheet | Where-Object name -eq $Name
    if (-not $sheet) { throw "Missing worksheet: $Name" }
    $rid = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $target = ($relationships.Relationships.Relationship | Where-Object Id -eq $rid).Target
    $entry = if ($target.StartsWith('/')) { $target.TrimStart('/') } else { 'xl/' + $target }
    $xml = Read-WorkbookXml $entry
    foreach ($row in $xml.worksheet.sheetData.row) {
      $cells = @{}
      foreach ($cell in $row.c) {
        $value = if ($cell.t -eq 's') { $strings[[int]$cell.v] } elseif ($cell.t -eq 'inlineStr') { $cell.is.InnerText } else { [string]$cell.v }
        $cells[($cell.r -replace '\d', '')] = [string]$value
      }
      [pscustomobject]@{ Number = [int]$row.r; Cells = $cells }
    }
  }

  $zipCodes = [ordered]@{ NY = @(); NJ = @(); CT = @() }
  $counties = [ordered]@{ NY = @(); NJ = @(); CT = @() }
  $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  foreach ($row in (Read-Sheet 'ZIP Codes' | Where-Object Number -gt 1)) {
    $state = $row.Cells['A']; $zip = $row.Cells['B']
    if (-not $zipCodes.Contains($state)) { throw "Unexpected state in ZIP Codes row $($row.Number): $state" }
    # Do not parse numbers or infer padding: the source must supply all five digits.
    if ($zip.Length -ne 5 -or $zip -cnotmatch '^[0-9]{5}$') { throw "Invalid ZIP string at row $($row.Number): $zip" }
    if (-not $seen.Add($zip)) { throw "Duplicate ZIP at row $($row.Number): $zip" }
    if ($row.Cells['C']) { throw 'Workbook now has ZIP-to-county mappings; review before replacing the dataset.' }
    $zipCodes[$state] += $zip
  }
  foreach ($row in (Read-Sheet 'County Coverage' | Where-Object Number -gt 1)) {
    $state = $row.Cells['A']
    # MA and RI are intentionally excluded: the approved scope is NY, NJ, CT.
    if ($counties.Contains($state)) { $counties[$state] += $row.Cells['B'] + ' County' }
  }
  $expected = @{ NY = 363; NJ = 236; CT = 122 }
  foreach ($state in $expected.Keys) {
    if ($zipCodes[$state].Count -ne $expected[$state]) { throw "Unexpected ZIP count for ${state}: $($zipCodes[$state].Count)" }
    $zipCodes[$state] = @($zipCodes[$state] | Sort-Object)
  }
  if (($counties.Values | ForEach-Object { $_ } | Measure-Object).Count -ne 18) { throw 'Expected 18 approved county entries.' }
  $data = [ordered]@{
    sourceFile = [IO.Path]::GetFileName($WorkbookPath)
    sourceSha256 = $sourceHash
    zipCodes = $zipCodes
    counties = $counties
  }
  $json = $data | ConvertTo-Json -Depth 5
  [IO.File]::WriteAllText([IO.Path]::GetFullPath($OutputPath), $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
  Write-Output "Extracted $($seen.Count) unique ZIP strings: NY=$($zipCodes.NY.Count), NJ=$($zipCodes.NJ.Count), CT=$($zipCodes.CT.Count); 18 county names; no ZIP-to-county mapping."
  Write-Output "Source SHA-256: $sourceHash"
} finally {
  $archive.Dispose()
}
