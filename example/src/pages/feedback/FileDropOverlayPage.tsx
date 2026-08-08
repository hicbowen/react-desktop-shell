import { useState, type ComponentProps } from 'react'
import {
  CircleCheck,
  FileImage,
  FileSpreadsheet,
  UploadCloud,
} from '../../components/fluentIcons'
import { AppFileDropOverlay } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const imageAccept = ['image/*']
const spreadsheetAccept = ['.xlsx', '.csv']

function ReceivedFiles({ files }: { files: File[] }) {
  const t = useDemoCopy()

  return (
    <div className="demo-file-drop-results">
      <strong>{t('Received')} {files.length} {t('files')}</strong>
      <ul>{files.slice(0, 3).map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul>
      {files.length > 3 ? <span>+{files.length - 3} {t('more files')}</span> : null}
    </div>
  )
}

function DropSurfaceContent({ files }: { files: File[] }) {
  const t = useDemoCopy()

  return (
    <div className="demo-file-drop-stage">
      <div className="demo-file-drop-stage__content">
        <div className="demo-file-drop-stage__icon" aria-hidden="true">
          {files.length > 0 ? <CircleCheck /> : <UploadCloud />}
        </div>
        {files.length > 0 ? (
          <ReceivedFiles files={files} />
        ) : (
          <div className="demo-file-drop-stage__copy">
            <strong>{t('Drop files here')}</strong>
            <span>{t('All file types are supported. You can drop multiple files at once.')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function LatestDropResult({
  files,
  lastReject,
}: {
  files: File[]
  lastReject: string
}) {
  const t = useDemoCopy()

  return (
    <div className="demo-file-drop-card demo-file-drop-card--result">
      <strong>{t('Latest result')}</strong>
      {files.length > 0 ? (
        <ReceivedFiles files={files} />
      ) : (
        <span>{t('No files received yet')}</span>
      )}
      <span>{t('Last rejection:')} {t(lastReject)}</span>
    </div>
  )
}

export function AppFileDropOverlayPage() {
  const t = useDemoCopy()
  const [pageFiles, setPageFiles] = useState<File[]>([])
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const [lastReject, setLastReject] = useState('None')
  const handleReject: ComponentProps<typeof AppFileDropOverlay>['onReject'] =
    (files, reason) => setLastReject(`${t(reason)}：${files.length} ${t('files rejected')}`)

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
            <DropSurfaceContent files={pageFiles} />
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
          <LatestDropResult files={localFiles} lastReject={lastReject} />
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
