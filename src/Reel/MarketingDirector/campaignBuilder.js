export function buildOfficialCampaignScenes({
  campaign,
  media = [],
  logo = "",
}) {
  if (!campaign) return [];

  const available = media.filter((item) => item?.src);

  return campaign.captions.map((caption, index) => {
    const item =
      available[index % Math.max(1, available.length)] ||
      { src: logo, type: "image" };

    const isFirst = index === 0;
    const isLast = index === campaign.captions.length - 1;

    return {
      id: `official-${campaign.id}-${Date.now()}-${index}`,
      media: item?.src || logo || "",
      mediaType: item?.type || "image",
      mediaSource: item?.source || "screen-capture",
      duration: campaign.duration / campaign.captions.length,
      title: caption,
      subtitle: isLast
        ? "tuscomercios.com.ar"
        : campaign.steps[index] || "",
      cameraMovement:
        index % 3 === 0
          ? "pushIn"
          : index % 3 === 1
          ? "panRight"
          : "kenBurns",
      cameraEasing: "cinematic",
      transition:
        index % 2 === 0 ? "smooth" : "fade",
      transitionDuration: 0.45,
      textPosition: isFirst ? "center" : "bottom",
      textAlign: "center",
      textAnimation: "rise",
      subtitleStyle: "word-reveal",
      showLogo: isFirst || isLast,
      showCta: isLast,
      cta: isLast ? "Conocé más" : "",
      officialCampaignId: campaign.id,
    };
  });
}
