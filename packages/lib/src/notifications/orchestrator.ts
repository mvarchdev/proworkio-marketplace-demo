import type {
  NotificationAttempt,
  NotificationChannel,
  NotificationMessage,
} from "@proworkio/types";

export interface NotificationChannelAvailability {
  email?: boolean;
  whatsapp?: boolean;
  sms?: boolean;
}

const defaultFallbackOrder: NotificationChannel[] = ["email", "whatsapp", "sms"];

export function resolveFallbackPlan(
  message: NotificationMessage,
  availability: NotificationChannelAvailability,
  history: NotificationAttempt[],
) {
  const failedChannels = new Set(
    history
      .filter((attempt) =>
        ["undeliverable", "provider_failed", "rate_limited"].includes(attempt.status),
      )
      .map((attempt) => attempt.channel),
  );

  const orderedChannels = [
    ...message.preferredChannels,
    ...defaultFallbackOrder.filter((channel) => !message.preferredChannels.includes(channel)),
  ];

  return orderedChannels.filter(
    (channel, index, array) =>
      array.indexOf(channel) === index &&
      availability[channel] !== false &&
      !failedChannels.has(channel),
  );
}
