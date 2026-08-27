import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function HomePage() {
  const t = useTranslations('home');
  const common = useTranslations('common');

  return (
    <Box
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      sx={{ bgcolor: 'background.default' }}
    >
      <Box className="absolute top-4 right-6 z-20">
        <LanguageSwitcher />
      </Box>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'rgba(92,107,64,0.18)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'rgba(196,154,108,0.12)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl gap-6">
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
          label={t('badge')}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(168,192,144,0.35)', color: '#A8C090', fontSize: '0.75rem' }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #EDE8D8 0%, #9E9588 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('title')}{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #A8C090 0%, #C49A6C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('titleAccent')}
          </Box>
        </Typography>

        <Typography
          variant="h6"
          sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 500, lineHeight: 1.6 }}
        >
          {t('description')}
        </Typography>

        <Box className="flex gap-3 mt-2">
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              background: 'linear-gradient(135deg, #5C6B40 0%, #A8C090 100%)',
              color: '#1a1f14',
              fontWeight: 600,
              px: 4,
            }}
          >
            {common('getStarted')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'rgba(168,192,144,0.2)',
              color: 'text.secondary',
              px: 4,
              '&:hover': { borderColor: 'rgba(168,192,144,0.4)', bgcolor: 'rgba(168,192,144,0.05)' },
            }}
          >
            {common('learnMore')}
          </Button>
        </Box>

        <Box className="grid grid-cols-3 gap-8 mt-12 w-full max-w-md">
          {[
            { label: t('statOrgsLabel'), value: t('statOrgs'), color: '#A8C090' },
            { label: t('statOrdersLabel'), value: t('statOrders'), color: '#C49A6C' },
            { label: t('statAccessLabel'), value: t('statAccess'), color: '#8B5A35' },
          ].map((stat) => (
            <Box key={stat.label} className="flex flex-col items-center gap-1">
              <Typography variant="h6" sx={{ color: stat.color, fontWeight: 700 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </div>
    </Box>
  );
}