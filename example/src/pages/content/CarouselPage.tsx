import {
  Cloud,
  Palette,
  Users,
} from '../../components/fluentIcons'
import {
  AppButton,
  AppCarousel,
  type AppCarouselSlide,
} from '../../../../src'
import alpineLake from '../../assets/carousel/alpine-lake.webp'
import coastalCliffs from '../../assets/carousel/coastal-cliffs.webp'
import forestLake from '../../assets/carousel/forest-lake.webp'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppCarouselPage() {
  const t = useDemoCopy()

  const bannerSlides: AppCarouselSlide[] = [
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
  ]

  const gallerySlides: AppCarouselSlide[] = [
    {
      key: 'alpine-lake',
      eyebrow: t('Mountain retreat'),
      title: t('Blue hour by the lake'),
      description: t('A quiet shoreline beneath layers of mist and mountain light.'),
      visual: <img alt="" src={alpineLake} />,
      visualAriaLabel: t('An alpine lake and cabin at blue hour'),
    },
    {
      key: 'coastal-cliffs',
      eyebrow: t('Coastal route'),
      title: t('Cliffs above the quiet cove'),
      description: t('A high path opens onto turquoise water and a distant headland.'),
      visual: <img alt="" src={coastalCliffs} />,
      visualAriaLabel: t('Sea cliffs surrounding a turquoise cove'),
    },
    {
      key: 'forest-lake',
      eyebrow: t('Forest morning'),
      title: t('Mist settles over the water'),
      description: t('Evergreen reflections frame a still lake after the rain.'),
      visual: <img alt="" src={forestLake} />,
      visualAriaLabel: t('A misty evergreen forest reflected in a lake'),
    },
  ]

  const walkthroughSlides: AppCarouselSlide[] = [
    {
      key: 'organize',
      eyebrow: t('Get started'),
      title: t('Organize your first workspace'),
      description: t('Collect the people and recent work that belong together.'),
      visual: (
        <div className="demo-carousel-tour-visual demo-carousel-tour-visual--people">
          <Users />
        </div>
      ),
    },
    {
      key: 'connect',
      eyebrow: t('Connect services'),
      title: t('Bring daily tools into one place'),
      description: t('Keep files, calendars, and messages close to the work.'),
      visual: (
        <div className="demo-carousel-tour-visual demo-carousel-tour-visual--cloud">
          <Cloud />
        </div>
      ),
    },
    {
      key: 'personalize',
      eyebrow: t('Make it yours'),
      title: t('Choose a look that feels familiar'),
      description: t('Use a comfortable theme before opening the workspace.'),
      action: <AppButton appearance="primary">{t('Finish tour')}</AppButton>,
      visual: (
        <div className="demo-carousel-tour-visual demo-carousel-tour-visual--palette">
          <Palette />
        </div>
      ),
    },
  ]

  const announcementSlides: AppCarouselSlide[] = [
    {
      key: 'release',
      eyebrow: t('Release notes'),
      title: t('A clearer way to stay up to date'),
      description: t('See small improvements and useful updates without leaving the current workflow.'),
      action: <AppButton>{t('View release notes')}</AppButton>,
    },
    {
      key: 'maintenance',
      eyebrow: t('Scheduled maintenance'),
      title: t('Cloud sync will pause briefly'),
      description: t('Connected files and messages will resume syncing automatically after 02:30.'),
    },
  ]

  return (
    <DemoPage>
      <DemoSection
        description={t('Combine concise copy, an illustration, and a focused action in a homepage promotion.')}
        title={t('Promotional banner')}
      >
        <DemoPreview>
          <AppCarousel
            ariaLabel={t('Promotional banner')}
            layout="split"
            slides={bannerSlides}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection
        description={t('Let photography fill the carousel and place a readable caption over each image.')}
        title={t('Image gallery')}
      >
        <DemoPreview>
          <AppCarousel
            ariaLabel={t('Travel photo gallery')}
            layout="media"
            slides={gallerySlides}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection
        description={t('Center an illustration above the copy for onboarding and feature education.')}
        title={t('Feature walkthrough')}
      >
        <DemoPreview>
          <AppCarousel
            ariaLabel={t('Workspace feature walkthrough')}
            layout="stacked"
            slides={walkthroughSlides}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection
        description={t('Use the text-only form for product news, maintenance messages, and other short notices.')}
        title={t('Announcement carousel')}
      >
        <DemoPreview>
          <AppCarousel
            ariaLabel={t('Product announcements')}
            slides={announcementSlides}
          />
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
