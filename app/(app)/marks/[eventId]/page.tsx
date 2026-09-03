import { EventHistory } from '@/components/my-marks-screen'

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  return <EventHistory eventId={eventId} />
}
