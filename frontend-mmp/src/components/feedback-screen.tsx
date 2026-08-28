import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type FeedbackScreenProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  busy?: boolean;
};

export function FeedbackScreen({
  title,
  description,
  eyebrow,
  actions,
  busy = false,
}: FeedbackScreenProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 3,
        py: 6,
        backgroundColor: '#F5F0E8',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 4,
          px: { xs: 4, sm: 5 },
          py: { xs: 5, sm: 6 },
          border: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Stack spacing={3}>
          {busy ? <CircularProgress size={36} thickness={4} /> : null}

          <Stack spacing={1.5}>
            {eyebrow ? (
              <Typography variant="overline" sx={{ letterSpacing: '0.16em', color: 'text.secondary' }}>
                {eyebrow}
              </Typography>
            ) : null}

            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>

            <Typography color="text.secondary">{description}</Typography>
          </Stack>

          {actions ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {actions}
            </Stack>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
