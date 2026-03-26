interface GuestSubmissionClaimInput {
  guestRequestIds: string[];
  existingRequestIds: string[];
}

export function resolveClaimedRequestIds(input: GuestSubmissionClaimInput) {
  const merged = new Set<string>(input.existingRequestIds);
  for (const requestId of input.guestRequestIds) {
    merged.add(requestId);
  }

  return [...merged];
}
