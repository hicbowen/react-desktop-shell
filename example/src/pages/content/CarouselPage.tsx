import {
  Cloud,
  Palette,
  Users,
  WandSparkles,
} from '../../components/fluentIcons'
import {
  AppButton,
  AppCarousel,
  type AppCarouselSlide,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppCarouselPage() {
  const t = useDemoCopy()
  const slides: AppCarouselSlide[] = [
    {
      key: 'workspace',
      eyebrow: t('Workspace overview'),
      title: t('Keep the team moving'),
      description: t('See recent activity and continue work from one focused workspace.'),
      action: <AppButton appearance="primary">{t('Open workspace')}</AppButton>,
      visual: (
        <div className="demo-carousel-visual demo-carousel-visual--workspace">
          <div className="demo-carousel-visual__glow" />
          <div className="demo-carousel-visual__stack">
            <div className="demo-carousel-visual__tile demo-carousel-visual__tile--main">
              <Users />
              <span>{t('Team activity')}</span>
              <strong>24</strong>
            </div>
            <div className="demo-carousel-visual__tile demo-carousel-visual__tile--small">
              <span>{t('Members online')}</span>
              <strong>08</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'cloud',
      eyebrow: t('Connected data'),
      title: t('Bring your services together'),
      description: t('Keep connected services ready for the next task with one clear overview.'),
      action: <AppButton>{t('Review connections')}</AppButton>,
      visual: (
        <div className="demo-carousel-visual demo-carousel-visual--cloud">
          <div className="demo-carousel-visual__cloud-icon">
            <Cloud />
          </div>
          <div className="demo-carousel-visual__status-list">
            <span>{t('Files')}</span>
            <span>{t('Calendar')}</span>
            <span>{t('Messages')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'appearance',
      eyebrow: t('Workspace appearance'),
      title: t('Make daily work feel comfortable'),
      description: t('Choose a calm visual style that keeps the important work in focus.'),
      action: <AppButton>{t('Open settings')}</AppButton>,
      visual: (
        <div className="demo-carousel-visual demo-carousel-visual--appearance">
          <Palette className="demo-carousel-visual__palette-icon" />
          <div className="demo-carousel-visual__swatches">
            <span />
            <span />
            <span />
          </div>
        </div>
      ),
    },
    {
      key: 'updates',
      eyebrow: t('Recent improvements'),
      title: t('A clearer way to stay up to date'),
      description: t('See small improvements and useful updates without leaving the current workflow.'),
      action: <AppButton>{t('View release notes')}</AppButton>,
      visual: (
        <div className="demo-carousel-visual demo-carousel-visual--updates">
          <div className="demo-carousel-visual__sparkle">
            <WandSparkles />
          </div>
          <div className="demo-carousel-visual__update-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      ),
    },
  ]

  return (
    <DemoPage>
      <DemoSection
        description={t('A wide homepage banner with manual navigation and a focused action.')}
        title={t('Homepage banner')}
      >
        <DemoPreview>
          <AppCarousel ariaLabel={t('Homepage banner')} slides={slides} />
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
