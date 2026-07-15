import { useState, type ComponentProps } from 'react'
import { FileImage, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { AppFileDropOverlay } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const imageAccept = ['image/*']
const spreadsheetAccept = ['.xlsx', '.csv']

function ReceivedFiles({ files }: { files: File[] }) {
  return (
    <div className="demo-file-drop-results">
      <strong>Received {files.length} files</strong>
      {files.length > 0 ? (
        <ul>{files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul>
      ) : (
        <span>Drag files into this region to test the overlay.</span>
      )}
    </div>
  )
}

export function AppFileDropOverlayPage() {
  const [pageFiles, setPageFiles] = useState<File[]>([])
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const [lastReject, setLastReject] = useState('None')
  const handleReject: ComponentProps<typeof AppFileDropOverlay>['onReject'] =
    (files, reason) => setLastReject(`${reason}: ${files.length} file(s)`)

  return (
    <DemoPage>
      <DemoSection title="Large drop surface" description="The overlay only intercepts file drags inside this wrapped region and disappears after drop or the final dragleave.">
        <DemoPreview className="demo-file-drop-large">
          <AppFileDropOverlay
            description="Any standard browser File is accepted"
            icon={<UploadCloud />}
            onFiles={setPageFiles}
            onReject={handleReject}
            style={{ height: '100%', width: '100%' }}
          >
            <div className="demo-file-drop-stage">
              <UploadCloud size={28} />
              <ReceivedFiles files={pageFiles} />
            </div>
          </AppFileDropOverlay>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Acceptance rules and states">
        <DemoPreview className="demo-file-drop-grid">
          <AppFileDropOverlay accept={imageAccept} description="PNG, JPEG, GIF, and other image MIME types" icon={<FileImage />} onFiles={setLocalFiles} onReject={handleReject}>
            <div className="demo-file-drop-card"><strong>Images only</strong><span>accept: image/*</span></div>
          </AppFileDropOverlay>
          <AppFileDropOverlay accept={spreadsheetAccept} description="Excel workbook or CSV" icon={<FileSpreadsheet />} onFiles={setLocalFiles} onReject={handleReject}>
            <div className="demo-file-drop-card"><strong>Spreadsheet data</strong><span>accept: .xlsx, .csv</span></div>
          </AppFileDropOverlay>
          <AppFileDropOverlay multiple={false} onFiles={setLocalFiles} onReject={handleReject} rejectDescription="Drop exactly one file at a time">
            <div className="demo-file-drop-card"><strong>Single file</strong><span>Multiple files are rejected as one batch</span></div>
          </AppFileDropOverlay>
          <AppFileDropOverlay accept={['.supported-demo']} onFiles={setLocalFiles} onReject={handleReject} rejectDescription="This preview intentionally rejects ordinary files">
            <div className="demo-file-drop-card"><strong>Reject preview</strong><span>Drag a file to inspect the reject state</span></div>
          </AppFileDropOverlay>
          <AppFileDropOverlay disabled onFiles={setLocalFiles}>
            <div className="demo-file-drop-card demo-file-drop-card--disabled"><strong>Disabled</strong><span>Drag events pass through without activation</span></div>
          </AppFileDropOverlay>
          <div className="demo-file-drop-card"><ReceivedFiles files={localFiles} /><span>Last rejection: {lastReject}</span></div>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
