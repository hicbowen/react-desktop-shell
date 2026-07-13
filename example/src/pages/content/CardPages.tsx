import { useState } from 'react'
import {
  Blend,
  CheckCircle2,
  Cloud,
  DatabaseBackup,
  Ellipsis,
  FileUp,
  HardDrive,
  Palette,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  AppCard,
  AppCardFooter,
  AppCardGroup,
  AppCardHeader,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const sameSurfaceContent = (
  <AppCardHeader
    title="最近项目"
    description="继续处理上次打开的工作区"
  />
)

export function AppCardPage() {
  const [mode, setMode] = useState('local')
  const [cardActivations, setCardActivations] = useState(0)
  const [internalStatus, setInternalStatus] = useState('尚未执行操作')

  return (
    <DemoPage>
      <DemoSection title="Static surface">
        <DemoPreview>
          <AppCard>
            <AppCardHeader
              icon={<Users />}
              title="学生概览"
              description="当前班级共有 24 名学生"
            />
            <div>本周已完成 18 份课后反馈。</div>
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Header, content, and footer">
        <DemoPreview>
          <AppCard>
            <AppCardHeader
              icon={<DatabaseBackup />}
              title="数据备份"
              description="保护应用中的本地数据"
              action={
                <button aria-label="更多备份选项" type="button">
                  <Ellipsis size={16} />
                </button>
              }
            />
            <div>上次备份时间：今天 10:30</div>
            <AppCardFooter
              start={<span>共 24.6 MB</span>}
              end={<button type="button">立即备份</button>}
            />
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Footer separation">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--comparison">
            <AppCard>
              <div>默认 Footer</div>
              <AppCardFooter end={<button type="button">更新</button>} start="10:30" />
            </AppCard>
            <AppCard>
              <div>Divided Footer</div>
              <AppCardFooter divided end={<button type="button">更新</button>} start="10:30" />
            </AppCard>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Appearance">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--comparison">
            <AppCard appearance="filled">{sameSurfaceContent}</AppCard>
            <AppCard appearance="outlined">{sameSurfaceContent}</AppCard>
            <AppCard appearance="subtle">{sameSurfaceContent}</AppCard>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Horizontal tool card">
        <DemoPreview>
          <AppCard orientation="horizontal">
            <span className="demo-card-tool-icon"><FileUp /></span>
            <div className="demo-card-tool-content">
              <strong>数据导入</strong>
              <span>从 Excel 导入学生信息</span>
            </div>
            <button type="button">选择文件</button>
          </AppCard>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Interactive states">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--states">
            <AppCard onClick={() => setCardActivations((count) => count + 1)}>
              <AppCardHeader title="正常" description="点击、悬停或按 Enter" />
            </AppCard>
            <AppCard className="demo-card-state--hover" interactive>
              <AppCardHeader title="Hover" description="状态参考" />
            </AppCard>
            <AppCard className="demo-card-state--pressed" interactive>
              <AppCardHeader title="Pressed" description="状态参考" />
            </AppCard>
            <AppCard className="demo-card-state--focus" interactive>
              <AppCardHeader title="Focus" description="状态参考" />
            </AppCard>
            <AppCard disabled onClick={() => undefined}>
              <AppCardHeader title="Disabled" description="不可操作" />
            </AppCard>
          </div>
          <div className="demo-note">卡片激活次数：{cardActivations}</div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Selected mode">
        <DemoPreview>
          <div className="demo-card-grid demo-card-grid--comparison">
            {[
              { key: 'local', title: '本地模式', icon: <HardDrive /> },
              { key: 'cloud', title: '云端模式', icon: <Cloud /> },
              { key: 'hybrid', title: '混合模式', icon: <Blend /> },
            ].map((item) => (
              <AppCard
                key={item.key}
                onClick={() => setMode(item.key)}
                selected={mode === item.key}
              >
                <AppCardHeader icon={item.icon} title={item.title} />
              </AppCard>
            ))}
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Continuous settings group">
        <DemoPreview>
          <AppCardGroup>
            <AppCard orientation="horizontal" padding="compact">
              <Palette size={18} />
              <span className="demo-card-group-label">应用主题</span>
              <strong>跟随系统</strong>
            </AppCard>
            <AppCard orientation="horizontal" padding="compact">
              <Sparkles size={18} />
              <span className="demo-card-group-label">强调颜色</span>
              <strong>蓝色</strong>
            </AppCard>
            <AppCard orientation="horizontal" padding="compact">
              <CheckCircle2 size={18} />
              <span className="demo-card-group-label">动画效果</span>
              <strong>开启</strong>
            </AppCard>
          </AppCardGroup>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Internal actions">
        <DemoPreview>
          <AppCard
            onClick={() => setInternalStatus('整张卡片已激活')}
          >
            <AppCardHeader
              title="可点击工具卡片"
              description="内部操作不会激活整张卡片"
              action={
                <button
                  type="button"
                  onClick={() => setInternalStatus('Header 操作已执行')}
                >
                  更多
                </button>
              }
            />
            <button
              type="button"
              onClick={() => setInternalStatus('主体操作已执行')}
            >
              主体操作
            </button>
            <AppCardFooter
              start={internalStatus}
              end={
                <button
                  type="button"
                  onClick={() => setInternalStatus('Footer 操作已执行')}
                >
                  完成
                </button>
              }
            />
          </AppCard>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
