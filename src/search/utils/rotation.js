const DEFAULT_ROTATION_MINUTES = 60;

const stringHash = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const businessKey = (business, index) =>
  String(
    business?.id ??
      business?._id ??
      business?.slug ??
      business?.email ??
      business?.name ??
      business?.nombre ??
      index
  );

export const getRotationPeriod = (date = new Date(), rotationMinutes = DEFAULT_ROTATION_MINUTES) =>
  Math.floor(date.getTime() / (Math.max(1, rotationMinutes) * 60 * 1000));

export const rotateBusinesses = (
  businesses = [],
  { seed = "tuscomercios", date = new Date(), rotationMinutes = DEFAULT_ROTATION_MINUTES } = {}
) => {
  const period = getRotationPeriod(date, rotationMinutes);

  return businesses
    .map((business, index) => ({
      business,
      index,
      score: stringHash(`${seed}:${period}:${businessKey(business, index)}`),
    }))
    .sort((first, second) => first.score - second.score || first.index - second.index)
    .map(({ business }) => business);
};
