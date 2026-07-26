import { useMemo, useRef, useState } from "react";

import ClipInspector from "./ClipInspector";
import TextProInspector from "./TextProInspector";
import MotionInspector from "./MotionInspector";
import MediaLibrary from "./MediaLibrary";
import SceneMediaInspector from "./SceneMediaInspector";
import VisualTrimEditor from "./VisualTrimEditor";
import CompositionInspector from "./CompositionInspector";
import SceneActionsInspector from "./SceneActionsInspector";
import AudioPanel from "./AudioPanel";
import VoiceAudioPanel from "./VoiceAudioPanel";
import AudioPreview from "./AudioPreview";
import ExportPanel from "./ExportPanel";
import ScreenRecorderPanel from "./ScreenRecorderPanel";
import TransitionInspector from "./TransitionInspector";
import TimelineCanvasPro from "./TimelineCanvasPro";
import Toolbar from "./Toolbar";
import VideoStage from "./VideoStage";
import CanvasControls from "./CanvasControls";
import MediaTransformInspector from "./MediaTransformInspector";
import StickerLibrary from "./StickerLibrary";
import StickerInspector from "./StickerInspector";
import LayersManager from "./LayersManager";
import ProjectRelinkPanel from "./ProjectRelinkPanel";
import { DEFAULT_PROJECT, VIEW_MODES } from "./constants";
import useHistory from "./useHistory";
import { generateVideoThumbnails } from "./thumbnailGenerator";
import {
  LAYER_TYPES,
  createTextLayer,
  createStickerLayer,
  deleteLayer,
  duplicateLayer,
  updateLayer,
  moveLayerForward,
  moveLayerBackward,
  bringLayerToFront,
  sendLayerToBack,
} from "./layerUtils";

import {
  ensureMotionLayer,
  ensureClipTransition,
} from "./motionUtils";

import {
  createAudioTrack,
  normalizeAudioTrack,
} from "./audioUtils";

import {
  buildProjectTimeline,
  projectTimeToClip,
} from "./projectTimeline";

import {
  createMediaItemFromFile,
  createMediaItemFromRecording,
  createClipFromMedia,
  getMediaById,
  replaceClipMedia,
} from "./mediaUtils";

import {
  resizeClipLeft,
  resizeClipRight,
  moveClipToProjectTime,
  resizeLayerLeft,
  resizeLayerRight,
  moveLayerByDelta,
  resizeAudioLeft,
  resizeAudioRight,
} from "./timelineEngineV2";
import {
  createInitialClip,
  deleteClip,
  duplicateClip,
  getProjectDuration,
  moveClipToIndex,
  splitClip,
  updateClip,
} from "./utils";

import {
  createProjectManifest,
  validateProjectManifest,
  downloadProjectManifest,
  matchProjectFiles,
} from "./projectPersistence";
import StudioMentorPanel from "../MentorIA/Components/StudioMentorPanel";
import { buildReelStudioContext } from "../MentorIA/Studio/studioContext";

function firstBrandValue(...values) {
  return values.find((value) =>
    typeof value === "string" && value.trim()
  ) || "";
}

function getBrandLogoUrl(brandKit) {
  return firstBrandValue(
    brandKit?.logoUrl,
    brandKit?.logo_url,
    brandKit?.logo?.url,
    brandKit?.logo?.src,
    brandKit?.logos?.primary,
    brandKit?.logos?.main,
    brandKit?.identity?.logoUrl,
    brandKit?.identity?.logo_url
  );
}

function getBrandColor(brandKit, key, fallback) {
  return firstBrandValue(
    brandKit?.colors?.[key],
    brandKit?.palette?.[key],
    brandKit?.identity?.colors?.[key]
  ) || fallback;
}

export default function ReelsStudioApp({
  business,
  brandKit,
  entityType = "business",
  entityId,
}) {

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadProjectRef = useRef(null);
  const recorderSectionRef = useRef(null);
  const exportSectionRef = useRef(null);
  const audioSectionRef = useRef(null);
  const voiceAudioSectionRef = useRef(null);
  const transitionSectionRef = useRef(null);
  const stickerSectionRef = useRef(null);
  const sourceObjectUrlRef = useRef("");
  const mediaInputRef = useRef(null);
  const relinkFilesRef = useRef(null);

  const collectedProjectFilesRef =
    useRef(new Map());

  const {
    value: project,
    setValue: setProject,
    reset: resetProject,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory({
    ...DEFAULT_PROJECT,
    name: `Reel ${business?.negocio || business?.name || "TusComercios"}`,
  });

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [audioTrack, setAudioTrack] = useState(null);
  const [voiceTrack, setVoiceTrack] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [activeTool, setActiveTool] = useState("media");

  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [safePreset, setSafePreset] = useState("instagram");

  const [pendingProject, setPendingProject] =
    useState(null);

  const [missingProjectFiles, setMissingProjectFiles] =
    useState([]);

  const selectedClip = useMemo(
    () =>
      project.clips.find(
        (clip) => clip.id === project.selectedClipId
      ) || null,
    [project.clips, project.selectedClipId]
  );

  const projectTimeline = useMemo(
    () =>
      buildProjectTimeline(
        project.clips
      ),
    [project.clips]
  );

  const finalDuration = useMemo(
    () =>
      projectTimeline.length
        ? projectTimeline[
          projectTimeline.length -
          1
        ].projectEnd
        : 0,
    [projectTimeline]
  );

  const selectedLayer = useMemo(
    () =>
      layers.find((layer) => layer.id === selectedLayerId) || null,
    [layers, selectedLayerId]
  );

  const selectedMedia = useMemo(
    () =>
      getMediaById(
        mediaItems,
        selectedMediaId
      ),
    [mediaItems, selectedMediaId]
  );

  const selectedClipMedia = useMemo(
    () =>
      selectedClip
        ? getMediaById(
          mediaItems,
          selectedClip.mediaId
        )
        : null,
    [
      mediaItems,
      selectedClip?.mediaId,
    ]
  );

  const selectedTimelineClip = useMemo(
    () =>
      projectTimeline.find(
        (clip) =>
          clip.id ===
          project.selectedClipId
      ) || null,
    [
      projectTimeline,
      project.selectedClipId,
    ]
  );

  const selectedClipIndex = useMemo(
    () =>
      project.clips.findIndex(
        (clip) =>
          clip.id ===
          project.selectedClipId
      ),
    [
      project.clips,
      project.selectedClipId,
    ]
  );

  async function uploadVideo(event) {
    await uploadMediaFiles(event);
  }

  async function uploadMediaFiles(event) {
    const files = Array.from(
      event.target.files || []
    );

    event.target.value = "";

    if (!files.length) return;

    try {
      setLoadingMedia(true);

      const newItems = [];

      for (const file of files) {
        if (
          !file.type.startsWith("video/") &&
          !file.type.startsWith("image/")
        ) {
          continue;
        }

        const item =
          await createMediaItemFromFile(
            file
          );

        newItems.push(item);
      }

      if (!newItems.length) {
        alert(
          "No encontramos fotos o videos compatibles."
        );
        return;
      }

      setMediaItems((current) => [
        ...current,
        ...newItems,
      ]);

      setSelectedMediaId(
        newItems[0].id
      );

      if (!project.clips.length) {
        const newClips =
          newItems.map(
            (item, index) =>
              createClipFromMedia(
                item,
                index
              )
          );

        setProject((current) => ({
          ...current,
          sourceDuration:
            newClips.reduce(
              (sum, clip) =>
                sum +
                (clip.end -
                  clip.start),
              0
            ),
          clips: newClips,
          selectedClipId:
            newClips[0]?.id ||
            "",
          updatedAt:
            new Date().toISOString(),
        }));

        setCurrentTime(0);
      }
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
        "No se pudo cargar el contenido."
      );
    } finally {
      setLoadingMedia(false);
    }
  }

  async function useScreenRecording(
    recording
  ) {
    try {
      setLoadingMedia(true);

      const item =
        await createMediaItemFromRecording(
          recording
        );

      setMediaItems((current) => [
        ...current,
        item,
      ]);

      setSelectedMediaId(item.id);

      addMediaAsScene(
        item,
        true
      );

      window.setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
        "No se pudo usar la grabación."
      );
    } finally {
      setLoadingMedia(false);
    }
  }

  function addMediaAsScene(
    mediaOrId,
    useCurrentState = false
  ) {
    const media =
      typeof mediaOrId === "string"
        ? getMediaById(
          mediaItems,
          mediaOrId
        )
        : mediaOrId;

    if (!media) return;

    const currentClips =
      useCurrentState
        ? project.clips
        : project.clips;

    const clip =
      createClipFromMedia(
        media,
        currentClips.length
      );

    setProject((current) => {
      const clips = [
        ...current.clips,
        {
          ...clip,
          name: `Escena ${current.clips.length +
            1
            }`,
        },
      ];

      return {
        ...current,
        clips,
        selectedClipId: clip.id,
        sourceDuration:
          clips.reduce(
            (sum, item) =>
              sum +
              (item.end -
                item.start),
            0
          ),
        updatedAt:
          new Date().toISOString(),
      };
    });

    const nextStart =
      projectTimeline.length
        ? projectTimeline[
          projectTimeline.length -
          1
        ].projectEnd
        : 0;

    setCurrentTime(nextStart);
    setPlaying(false);
  }

  function removeMedia(mediaId) {
    const isUsed =
      project.clips.some(
        (clip) =>
          clip.mediaId === mediaId
      );

    if (isUsed) {
      alert(
        "Este archivo está siendo usado en una escena. Eliminá o reemplazá esa escena primero."
      );
      return;
    }

    const media =
      getMediaById(
        mediaItems,
        mediaId
      );

    if (
      media?.url?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        media.url
      );
    }

    setMediaItems((current) =>
      current.filter(
        (item) =>
          item.id !== mediaId
      )
    );

    if (
      selectedMediaId === mediaId
    ) {
      setSelectedMediaId("");
    }
  }

  function replaceSelectedClipMedia(
    mediaId
  ) {
    const media =
      getMediaById(
        mediaItems,
        mediaId
      );

    if (
      !media ||
      !project.selectedClipId
    ) {
      return;
    }

    setProject((current) => ({
      ...current,
      clips: current.clips.map(
        (clip) =>
          clip.id ===
            current.selectedClipId
            ? replaceClipMedia(
              clip,
              media
            )
            : clip
      ),
      updatedAt:
        new Date().toISOString(),
    }));
  }

  function changeSelectedClip(
    changes
  ) {
    if (!project.selectedClipId) {
      return;
    }

    setProject((current) => {
      const clips = updateClip(
        current.clips,
        current.selectedClipId,
        changes
      );

      return {
        ...current,
        clips,
        sourceDuration: clips.reduce(
          (sum, item) =>
            sum + Math.max(0, Number(item.end) - Number(item.start)),
          0
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function cutHere() {
    const resolved =
      projectTimeToClip(
        project.clips,
        currentTime
      );

    if (!resolved) return;

    if (
      resolved.clip.mediaType ===
      "image"
    ) {
      alert(
        "Las fotos no necesitan corte. Cambiá su duración desde el panel de la escena."
      );
      return;
    }

    const nextClips = splitClip(
      project.clips,
      resolved.clip.id,
      resolved.sourceTime
    );

    if (nextClips === project.clips) {
      alert(
        "Mové el cursor un poco más lejos del borde para cortar."
      );
      return;
    }

    const nextTimeline =
      buildProjectTimeline(
        nextClips
      );

    const nextSelected =
      nextTimeline.find(
        (clip) =>
          currentTime >=
          clip.projectStart &&
          currentTime <=
          clip.projectEnd
      ) ||
      nextTimeline[
      nextTimeline.length - 1
      ];

    setProject((current) => ({
      ...current,
      clips: nextClips,
      selectedClipId:
        nextSelected?.id || "",
      updatedAt:
        new Date().toISOString(),
    }));
  }

  function selectClip(clipId) {
    const clip =
      projectTimeline.find(
        (item) =>
          item.id === clipId
      );

    setProject((current) => ({
      ...current,
      selectedClipId: clipId,
    }));

    if (clip) {
      setCurrentTime(
        clip.projectStart
      );

      videoRef.current?.seekProjectTime(
        clip.projectStart
      );
    }
  }

  function seek(time) {
    setCurrentTime(time);

    videoRef.current?.seekProjectTime(
      time
    );
  }

  function togglePlay() {
    if (
      !project.clips.length
    ) {
      return;
    }

    if (
      !playing &&
      currentTime >=
      finalDuration - 0.02
    ) {
      seek(0);
    }

    setPlaying(
      (value) => !value
    );
  }

  function saveProject() {
    const safeName =
      String(
        project.name ||
        "reel-studio"
      )
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(
          /[^a-z0-9-]/g,
          ""
        );

    const manifest =
      createProjectManifest({
        project,
        mediaItems,
        layers,
        audioTrack,
        voiceTrack,
        editorSettings: {
          snapEnabled,
          showSafeArea,
          showRulers,
          safePreset,
        },
      });

    downloadProjectManifest(
      manifest,
      safeName ||
      "reel-studio"
    );
  }

  async function loadProject(
    event
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    try {
      const parsed =
        validateProjectManifest(
          JSON.parse(
            await file.text()
          )
        );

      collectedProjectFilesRef.current =
        new Map();

      setPendingProject(
        parsed
      );

      setMissingProjectFiles([
        ...(parsed.references
          ?.media || []),
        ...(parsed.references
          ?.audio || []),
      ]);
    } catch (error) {
      alert(
        error.message ||
        "No se pudo abrir el proyecto."
      );
    }
  }

  async function relinkProjectFiles(
    event
  ) {
    const files =
      Array.from(
        event.target.files ||
        []
      );

    event.target.value = "";

    if (
      !pendingProject ||
      !files.length
    ) {
      return;
    }

    files.forEach(
      (file) => {
        const key =
          `${file.name}::${file.size}::${file.lastModified}`;

        collectedProjectFilesRef.current.set(
          key,
          file
        );
      }
    );

    const collectedFiles = [
      ...collectedProjectFilesRef.current.values(),
    ];

    try {
      setLoadingMedia(true);

      const matches =
        matchProjectFiles({
          files:
            collectedFiles,
          manifest:
            pendingProject,
        });

      if (
        matches.missing.length
      ) {
        setMissingProjectFiles(
          matches.missing
        );

        alert(
          `Faltan ${matches.missing.length} archivo(s). Podés agregarlos ahora, uno por uno o en grupos.`
        );

        return;
      }

      const restoredMedia = [];

      for (
        const match of
        matches.mediaMatches
      ) {
        const original =
          pendingProject.media.find(
            (item) =>
              item.id ===
              match.reference.id
          );

        const item =
          await createMediaItemFromFile(
            match.file
          );

        restoredMedia.push({
          ...item,
          ...original,
          id:
            match.reference.id,
          url: item.url,
          thumbnail:
            item.thumbnail,
          fileRef: {
            name:
              match.file.name,
            size:
              match.file.size,
            type:
              match.file.type,
            lastModified:
              match.file
                .lastModified,
          },
        });
      }

      const restoreAudioTrack =
        async (
          role,
          savedTrack
        ) => {
          if (!savedTrack) {
            return null;
          }

          const match =
            matches.audioMatches.find(
              (item) =>
                item.reference
                  .role === role
            );

          if (!match?.file) {
            return null;
          }

          const file =
            match.file;

          const url =
            URL.createObjectURL(
              file
            );

          return {
            ...savedTrack,
            url,
            fileRef: {
              name:
                file.name,
              size:
                file.size,
              type:
                file.type,
              lastModified:
                file.lastModified,
            },
          };
        };

      const restoredMusic =
        await restoreAudioTrack(
          "music",
          pendingProject.audio
            ?.music
        );

      const restoredVoice =
        await restoreAudioTrack(
          "voice",
          pendingProject.audio
            ?.voice
        );

      setMediaItems(
        restoredMedia
      );

      setLayers(
        pendingProject.layers ||
        []
      );

      setAudioTrack(
        restoredMusic
      );

      setVoiceTrack(
        restoredVoice
      );

      resetProject({
        ...DEFAULT_PROJECT,
        ...pendingProject.project,
        sourceUrl: "",
      });

      setSelectedMediaId(
        restoredMedia[0]?.id ||
        ""
      );

      setSelectedLayerId(
        ""
      );

      setSnapEnabled(
        pendingProject
          .editorSettings
          ?.snapEnabled ??
        true
      );

      setShowSafeArea(
        pendingProject
          .editorSettings
          ?.showSafeArea ??
        false
      );

      setShowRulers(
        pendingProject
          .editorSettings
          ?.showRulers ??
        false
      );

      setSafePreset(
        pendingProject
          .editorSettings
          ?.safePreset ||
        "instagram"
      );

      setCurrentTime(0);
      setPlaying(false);
      setThumbnails([]);

      setPendingProject(
        null
      );

      setMissingProjectFiles(
        []
      );

      collectedProjectFilesRef.current =
        new Map();

      alert(
        "Proyecto restaurado correctamente con escenas, archivos, textos, stickers y audio."
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
        "No se pudo restaurar el proyecto."
      );
    } finally {
      setLoadingMedia(false);
    }
  }



  function applyBrandKitToReel() {
    if (!brandKit) {
      alert("Primero completá y guardá tu Brand Kit.");
      return;
    }

    if (!project.clips.length) {
      alert("Subí una foto o video antes de aplicar la marca.");
      return;
    }

    const primaryFont = firstBrandValue(
      brandKit?.typography?.primaryFont,
      brandKit?.typography?.primary_font,
      brandKit?.fonts?.primary
    ) || "Arial";

    const secondaryFont = firstBrandValue(
      brandKit?.typography?.secondaryFont,
      brandKit?.typography?.secondary_font,
      brandKit?.fonts?.secondary
    ) || primaryFont;

    const primaryColor = getBrandColor(brandKit, "primary", "#2563eb");
    const textColor = getBrandColor(brandKit, "text", "#ffffff");
    const textSoft = getBrandColor(brandKit, "textSoft", textColor);
    const cornerRadius = Number(brandKit?.style?.cornerRadius || 14);
    const animation = brandKit?.content?.favoriteAnimation || "fade";
    const logoUrl = getBrandLogoUrl(brandKit);

    setLayers((current) => {
      const styled = current.map((layer) => {
        if (layer.type === LAYER_TYPES.SUBTITLE) {
          return {
            ...layer,
            fontFamily: secondaryFont,
            color: textSoft,
            backgroundEnabled: true,
            backgroundColor: primaryColor,
            backgroundRadius: cornerRadius,
            animation: layer.animation || animation,
          };
        }

        if (layer.type === LAYER_TYPES.TEXT) {
          return {
            ...layer,
            fontFamily: primaryFont,
            color: textColor,
            backgroundRadius: cornerRadius,
            animation: layer.animation || animation,
          };
        }

        return layer;
      });

      if (!logoUrl) return styled;

      const existingLogo = styled.find(
        (layer) => layer.brandLogo === true
      );

      if (existingLogo) {
        return styled.map((layer) =>
          layer.id === existingLogo.id
            ? { ...layer, stickerSrc: logoUrl, hidden: false }
            : layer
        );
      }

      return [
        ...styled,
        {
          id: `brand-logo-${Date.now()}`,
          type: LAYER_TYPES.STICKER,
          name: "Logo de marca",
          sticker: "",
          stickerSrc: logoUrl,
          stickerId: "brand-logo",
          brandLogo: true,
          start: 0,
          end: Math.max(0.2, finalDuration),
          x: 84,
          y: 12,
          stickerSize: 110,
          rotation: 0,
          opacity: 1,
          shadowEnabled: true,
          shadowColor: "#000000",
          shadowBlur: 8,
          animation: "fade",
          hidden: false,
          locked: false,
          zIndex: styled.reduce(
            (highest, layer) => Math.max(highest, Number(layer.zIndex || 0)),
            0
          ) + 1,
        },
      ];
    });

    alert(
      logoUrl
        ? "Marca aplicada: logo, colores y tipografías."
        : "Colores y tipografías aplicados. Tu Brand Kit no tiene un logo disponible."
    );
  }

  function addLayer(type) {
    if (!finalDuration) return;

    const layer = ensureMotionLayer(
      createTextLayer({
        type,
        currentTime,
        projectDuration:
          finalDuration,
        zIndex:
          layers.reduce(
            (highest, item) =>
              Math.max(
                highest,
                Number(
                  item.zIndex || 0
                )
              ),
            0
          ) + 1,
        brandKit,
      })
    );

    setLayers((current) => [
      ...current,
      layer,
    ]);

    setSelectedLayerId(
      layer.id
    );

    setPlaying(false);
    setCurrentTime(
      Math.min(
        layer.start + 0.12,
        Math.max(
          layer.start,
          layer.end - 0.05
        )
      )
    );
  }

  function addSticker(
    sticker
  ) {
    const layer =
      createStickerLayer({
        sticker,
        currentTime,
        projectDuration:
          finalDuration || 10,
        layers,
      });

    setLayers((current) => [
      ...current,
      layer,
    ]);

    setSelectedLayerId(
      layer.id
    );

    setPlaying(false);
    setCurrentTime(
      Math.min(
        layer.start + 0.12,
        Math.max(
          layer.start,
          layer.end - 0.05
        )
      )
    );
  }

  function changeSelectedLayer(changes) {
    if (!selectedLayerId) return;

    setLayers((current) =>
      updateLayer(current, selectedLayerId, changes)
    );
  }

  function setLayerStartHere() {
    if (!selectedLayer) return;

    changeSelectedLayer({
      start: Math.min(currentTime, selectedLayer.end - 0.1),
    });
  }

  function setLayerEndHere() {
    if (!selectedLayer) return;

    changeSelectedLayer({
      end: Math.max(currentTime, selectedLayer.start + 0.1),
    });
  }


  async function createTrackFromAudioFile(
    file,
    defaultVolume = 100
  ) {
    const url =
      URL.createObjectURL(file);

    const audio =
      new Audio(url);

    audio.preload =
      "metadata";

    const duration =
      await new Promise(
        (resolve, reject) => {
          audio.onloadedmetadata =
            () =>
              resolve(
                Number(
                  audio.duration || 0
                )
              );

          audio.onerror =
            () =>
              reject(
                new Error(
                  "No se pudo leer el audio."
                )
              );
        }
      );

    return {
      ...createAudioTrack({
        url,
        fileName:
          file.name ||
          "Narración",
        duration,
        projectDuration:
          finalDuration,
      }),
      volume:
        defaultVolume,
      fileRef: {
        name:
          file.name ||
          "Narración",
        size: Number(
          file.size || 0
        ),
        type:
          file.type ||
          "audio/*",
        lastModified:
          Number(
            file.lastModified ||
            0
          ),
      },
    };
  }

  async function uploadVoiceAudio(
    event
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      !file.type.startsWith(
        "audio/"
      ) &&
      !file.name
        .toLowerCase()
        .endsWith(".webm")
    ) {
      alert(
        "Seleccioná un archivo de audio."
      );
      return;
    }

    try {
      const track =
        await createTrackFromAudioFile(
          file,
          100
        );

      setVoiceTrack(
        track
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
        "No se pudo cargar la voz."
      );
    }
  }

  async function useVoiceRecording(
    blob,
    fileName
  ) {
    try {
      const file =
        new File(
          [blob],
          fileName ||
          "narracion.webm",
          {
            type:
              blob.type ||
              "audio/webm",
          }
        );

      const track =
        await createTrackFromAudioFile(
          file,
          100
        );

      setVoiceTrack(
        track
      );
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo usar la grabación."
      );
    }
  }

  function changeVoiceTrack(
    changes
  ) {
    setVoiceTrack(
      (current) =>
        current
          ? normalizeAudioTrack({
            ...current,
            ...changes,
          })
          : current
    );
  }

  function removeVoiceTrack() {
    if (
      voiceTrack?.url?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        voiceTrack.url
      );
    }

    setVoiceTrack(null);
  }

  async function uploadAudio(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("Seleccioná un archivo de audio.");
      return;
    }

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.preload = "metadata";

    const duration = await new Promise((resolve) => {
      audio.onloadedmetadata = () =>
        resolve(audio.duration || project.sourceDuration);

      audio.onerror = () =>
        resolve(project.sourceDuration);

      audio.load();
    });

    if (audioTrack?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(audioTrack.url);
    }

    setAudioTrack(
      {
        ...createAudioTrack({
          url,
          fileName: file.name,
          duration,
          projectDuration:
            finalDuration,
        }),
        fileRef: {
          name: file.name,
          size: Number(
            file.size || 0
          ),
          type:
            file.type ||
            "audio/*",
          lastModified:
            Number(
              file.lastModified ||
              0
            ),
        },
      }
    );
  }

  function changeAudioTrack(changes) {
    setAudioTrack((current) =>
      current
        ? normalizeAudioTrack({
          ...current,
          ...changes,
        })
        : current
    );
  }

  function removeAudioTrack() {
    if (audioTrack?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(audioTrack.url);
    }

    setAudioTrack(null);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 pb-24">
      <div className="mx-auto max-w-[1800px] p-3 sm:p-4 md:p-6">
        <ProjectRelinkPanel
          pendingProject={pendingProject}
          missingFiles={missingProjectFiles}
          onChooseFiles={() =>
            relinkFilesRef.current?.click()
          }
          onCancel={() => {
            setPendingProject(null);
            setMissingProjectFiles([]);
            collectedProjectFilesRef.current =
              new Map();
          }}
        />

        <header className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-5 text-white shadow-2xl md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                TusComercios Studio
              </p>

              <h1 className="mt-2 text-3xl font-black md:text-5xl">
                Reels Studio 2.0
              </h1>

              <p className="mt-3 max-w-3xl font-semibold text-blue-100">
                Timeline profesional con miniaturas, zoom, cursor preciso y escenas arrastrables.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-12 rounded-xl bg-white px-4 font-black text-slate-950"
              >
                Subir contenido
              </button>

              <button
                type="button"
                disabled={!project.clips.length}
                onClick={saveProject}
                className="min-h-12 rounded-xl bg-blue-600 px-4 font-black text-white disabled:opacity-40"
              >
                Guardar
              </button>

              <button
                type="button"
                onClick={() => loadProjectRef.current?.click()}
                className="min-h-12 rounded-xl bg-white/10 px-4 font-black text-white"
              >
                Abrir
              </button>

              <button
                type="button"
                disabled={!project.clips.length}
                onClick={() =>
                  setActiveTool("export")
                }
                className="min-h-12 rounded-xl bg-emerald-500 px-4 font-black text-slate-950 disabled:opacity-40"
              >
                Exportar
              </button>


              <button
                type="button"
                disabled={!project.clips.length || !brandKit}
                onClick={applyBrandKitToReel}
                title={
                  !brandKit
                    ? "Completá tu Brand Kit para aplicar la marca"
                    : !project.clips.length
                      ? "Subí una foto o video primero"
                      : "Aplicar logo, colores y tipografías del Brand Kit"
                }
                className="min-h-12 rounded-xl bg-amber-400 px-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🎨 Aplicar marca
              </button>

              <StudioMentorPanel
                business={business}
                entityType={entityType}
                entityId={entityId || business?.id}
                editorLabel="Reels Studio"
                disabled={!project.clips.length}
                studioContext={buildReelStudioContext({
                  business,
                  brandKit,
                  project,
                  layers,
                  audioTrack,
                  voiceTrack,
                  finalDuration,
                })}
              />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            onChange={uploadVideo}
            className="hidden"
          />

          <input
            ref={mediaInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            onChange={uploadMediaFiles}
            className="hidden"
          />

          <input
            ref={loadProjectRef}
            type="file"
            accept=".tcproject,.json,application/json"
            onChange={loadProject}
            className="hidden"
          />

          <input
            ref={relinkFilesRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.webm,.mp4,.mov,.mp3,.wav,.m4a,.ogg"
            onChange={relinkProjectFiles}
            className="hidden"
          />
        </header>

        <div className="mt-4">
          <Toolbar
            disabled={false}
            onUploadVideo={() => fileInputRef.current?.click()}
            onUploadMedia={() => mediaInputRef.current?.click()}
            onAddText={() => addLayer(LAYER_TYPES.TEXT)}
            onAddSubtitle={() => addLayer(LAYER_TYPES.SUBTITLE)}
            onOpenRecorder={() =>
              setActiveTool("recorder")
            }
            onOpenAudio={() =>
              setActiveTool("audio")
            }
            onOpenVoiceAudio={() =>
              setActiveTool("voice")
            }
            onOpenStickers={() =>
              setActiveTool("stickers")
            }
          />
        </div>

        <div className="sticky top-0 z-40 mt-4 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur-xl">
          <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Elegí una herramienta
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              ["media", "Contenido"],
              ["scene", "Escena"],
              ["text", "Texto y movimiento"],
              ["stickers", "Stickers"],
              ["layers", "Capas"],
              ["transition", "Transición"],
              ["recorder", "Grabar pantalla"],
              ["voice", "Voz"],
              ["audio", "Música"],
              ["export", "Exportar"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTool(value)}
                className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-black ${
                  activeTool === value
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="order-2 min-w-0 space-y-4 xl:order-1">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setProject((current) => ({
                        ...current,
                        viewMode: VIEW_MODES.ORIGINAL,
                      }))
                    }
                    className={`min-h-11 rounded-xl px-4 font-black ${project.viewMode === VIEW_MODES.ORIGINAL
                        ? "bg-white text-slate-950 shadow"
                        : "text-slate-500"
                      }`}
                  >
                    Video original
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setProject((current) => ({
                        ...current,
                        viewMode: VIEW_MODES.VERTICAL,
                      }))
                    }
                    className={`min-h-11 rounded-xl px-4 font-black ${project.viewMode === VIEW_MODES.VERTICAL
                        ? "bg-white text-slate-950 shadow"
                        : "text-slate-500"
                      }`}
                  >
                    Resultado vertical
                  </button>
                </div>

                <p className="text-sm font-black text-slate-500">
                  Reel final: {finalDuration.toFixed(2)}s
                </p>
              </div>

              <CanvasControls
                snapEnabled={snapEnabled}
                showSafeArea={showSafeArea}
                showRulers={showRulers}
                safePreset={safePreset}
                selectedLayer={selectedLayer}
                onToggleSnap={() =>
                  setSnapEnabled(
                    (value) => !value
                  )
                }
                onToggleSafeArea={() =>
                  setShowSafeArea(
                    (value) => !value
                  )
                }
                onToggleRulers={() =>
                  setShowRulers(
                    (value) => !value
                  )
                }
                onChangeSafePreset={
                  setSafePreset
                }
              />

              <AudioPreview
                track={audioTrack}
                currentTime={currentTime}
                playing={playing}
              />

              <AudioPreview
                track={voiceTrack}
                currentTime={currentTime}
                playing={playing}
              />

              <VideoStage
                ref={videoRef}
                mediaItems={mediaItems}
                viewMode={project.viewMode}
                currentTime={currentTime}
                playing={playing}
                clips={project.clips}
                onTimeUpdate={setCurrentTime}
                onPlayChange={setPlaying}
                onActiveClipChange={(clipId) =>
                  setProject((current) =>
                    current.selectedClipId === clipId
                      ? current
                      : {
                        ...current,
                        selectedClipId: clipId,
                      }
                  )
                }
                layers={layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onChangeLayer={(layerId, changes) =>
                  setLayers((current) =>
                    updateLayer(
                      current,
                      layerId,
                      changes
                    )
                  )
                }
                onDeselectLayer={() =>
                  setSelectedLayerId("")
                }
                onChangeClipMedia={(clipId, changes) =>
                  setProject((current) => ({
                    ...current,
                    clips: current.clips.map(
                      (clip) =>
                        clip.id === clipId
                          ? {
                            ...clip,
                            ...changes,
                          }
                          : clip
                    ),
                    updatedAt:
                      new Date().toISOString(),
                  }))
                }
                snapEnabled={snapEnabled}
                showSafeArea={showSafeArea}
                showRulers={showRulers}
                safePreset={safePreset}
              />

              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!project.clips.length}
                  className="min-h-14 rounded-2xl bg-slate-950 px-4 font-black text-white disabled:opacity-40"
                >
                  {playing ? "⏸ Pausar" : "▶ Reproducir"}
                </button>

                <button
                  type="button"
                  onClick={cutHere}
                  disabled={!selectedClip}
                  className="min-h-14 rounded-2xl bg-red-600 px-4 font-black text-white disabled:opacity-40"
                >
                  ✂ Dividir aquí
                </button>

                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  className="min-h-14 rounded-2xl bg-slate-100 px-4 font-black text-slate-700 disabled:opacity-40"
                >
                  ↶ Deshacer
                </button>

                <button
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  className="min-h-14 rounded-2xl bg-slate-100 px-4 font-black text-slate-700 disabled:opacity-40"
                >
                  ↷ Rehacer
                </button>
              </div>
            </section>

            {generatingThumbnails && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center font-black text-blue-700">
                Generando miniaturas del video...
              </div>
            )}

            <TimelineCanvasPro
              clips={project.clips}
              layers={layers}
              audioTrack={audioTrack}
              currentTime={currentTime}
              selectedClipId={project.selectedClipId}
              selectedLayerId={selectedLayerId}
              disabled={!project.clips.length}
              onSeek={seek}
              onSelectClip={selectClip}
              onSelectLayer={(layerId) => {
                setSelectedLayerId(layerId);

                const layer = layers.find(
                  (item) =>
                    item.id === layerId
                );

                if (layer) {
                  seek(layer.start);
                }
              }}
              onMoveClip={(clipId, targetProjectTime) =>
                setProject((current) => ({
                  ...current,
                  clips: moveClipToProjectTime(
                    current.clips,
                    clipId,
                    targetProjectTime
                  ),
                  updatedAt:
                    new Date().toISOString(),
                }))
              }
              onResizeClipLeft={(clipId, deltaSeconds) =>
                setProject((current) => ({
                  ...current,
                  clips: resizeClipLeft(
                    current.clips,
                    clipId,
                    deltaSeconds
                  ),
                  updatedAt:
                    new Date().toISOString(),
                }))
              }
              onResizeClipRight={(clipId, deltaSeconds) =>
                setProject((current) => ({
                  ...current,
                  clips: resizeClipRight(
                    current.clips,
                    clipId,
                    deltaSeconds
                  ),
                  updatedAt:
                    new Date().toISOString(),
                }))
              }
              onResizeLayerLeft={(layerId, deltaSeconds) =>
                setLayers((current) =>
                  resizeLayerLeft(
                    current,
                    layerId,
                    deltaSeconds
                  )
                )
              }
              onResizeLayerRight={(layerId, deltaSeconds) =>
                setLayers((current) =>
                  resizeLayerRight(
                    current,
                    layerId,
                    deltaSeconds,
                    finalDuration
                  )
                )
              }
              onMoveLayer={(layerId, deltaSeconds) =>
                setLayers((current) =>
                  moveLayerByDelta(
                    current,
                    layerId,
                    deltaSeconds,
                    finalDuration
                  )
                )
              }
              onResizeAudioLeft={(deltaSeconds) =>
                setAudioTrack((current) =>
                  resizeAudioLeft(
                    current,
                    deltaSeconds
                  )
                )
              }
              onResizeAudioRight={(deltaSeconds) =>
                setAudioTrack((current) =>
                  resizeAudioRight(
                    current,
                    deltaSeconds,
                    finalDuration
                  )
                )
              }
              onOpenTransition={() =>
                setActiveTool("transition")
              }
            />


          </main>

          <aside className="order-1 min-w-0 space-y-4 xl:order-2 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-2">
            {activeTool === "media" && <MediaLibrary
              mediaItems={mediaItems}
              selectedMediaId={selectedMediaId}
              disabled={loadingMedia}
              onUpload={uploadMediaFiles}
              onSelect={setSelectedMediaId}
              onAddScene={addMediaAsScene}
              onRemove={removeMedia}
            />}

            {activeTool === "recorder" && <div ref={recorderSectionRef}>
              <ScreenRecorderPanel
                disabled={false}
                onUseRecording={useScreenRecording}
              />
            </div>}

            {activeTool === "voice" && <div ref={voiceAudioSectionRef}>
              <VoiceAudioPanel
                track={voiceTrack}
                projectDuration={finalDuration}
                disabled={!project.clips.length}
                onUpload={uploadVoiceAudio}
                onUseRecording={useVoiceRecording}
                onChange={changeVoiceTrack}
                onRemove={removeVoiceTrack}
              />
            </div>}

            {activeTool === "audio" && <div ref={audioSectionRef}>
              <AudioPanel
                track={audioTrack}
                projectDuration={project.sourceDuration}
                disabled={!project.clips.length}
                onUpload={uploadAudio}
                onChange={changeAudioTrack}
                onRemove={removeAudioTrack}
              />
            </div>}

            {activeTool === "export" && <div ref={exportSectionRef}><ExportPanel
              project={project}
              business={business}
              mediaItems={mediaItems}
              layers={layers}
              audioTrack={audioTrack}
              voiceTrack={voiceTrack}
              disabled={!project.clips.length}
            /></div>}

            {activeTool === "scene" && <>
            <SceneActionsInspector
              clip={selectedClip}
              index={selectedClipIndex}
              total={project.clips.length}
              disabled={!selectedClip}
              onChange={changeSelectedClip}
              onDuplicate={() => {
                if (!selectedClip) return;

                setProject((current) => {
                  const index =
                    current.clips.findIndex(
                      (clip) =>
                        clip.id ===
                        current.selectedClipId
                    );

                  if (index < 0) return current;

                  const copy = {
                    ...current.clips[index],
                    id: `${current.clips[index].id}-copy-${Date.now()}`,
                    name: `${current.clips[index].name} copia`,
                  };

                  const clips = [
                    ...current.clips.slice(
                      0,
                      index + 1
                    ),
                    copy,
                    ...current.clips.slice(
                      index + 1
                    ),
                  ];

                  return {
                    ...current,
                    clips,
                    selectedClipId: copy.id,
                    updatedAt:
                      new Date().toISOString(),
                  };
                });
              }}
              onDelete={() => {
                if (!selectedClip) return;

                setProject((current) => {
                  const index =
                    current.clips.findIndex(
                      (clip) =>
                        clip.id ===
                        current.selectedClipId
                    );

                  const clips =
                    current.clips.filter(
                      (clip) =>
                        clip.id !==
                        current.selectedClipId
                    );

                  const next =
                    clips[
                    Math.min(
                      Math.max(
                        0,
                        index - 1
                      ),
                      Math.max(
                        0,
                        clips.length - 1
                      )
                    )
                    ];

                  return {
                    ...current,
                    clips,
                    selectedClipId:
                      next?.id || "",
                    updatedAt:
                      new Date().toISOString(),
                  };
                });
              }}
              onMoveLeft={() =>
                setProject((current) => {
                  const index =
                    current.clips.findIndex(
                      (clip) =>
                        clip.id ===
                        current.selectedClipId
                    );

                  if (index <= 0) {
                    return current;
                  }

                  const clips = [
                    ...current.clips,
                  ];

                  [
                    clips[index - 1],
                    clips[index],
                  ] = [
                      clips[index],
                      clips[index - 1],
                    ];

                  return {
                    ...current,
                    clips,
                    updatedAt:
                      new Date().toISOString(),
                  };
                })
              }
              onMoveRight={() =>
                setProject((current) => {
                  const index =
                    current.clips.findIndex(
                      (clip) =>
                        clip.id ===
                        current.selectedClipId
                    );

                  if (
                    index < 0 ||
                    index >=
                    current.clips.length -
                    1
                  ) {
                    return current;
                  }

                  const clips = [
                    ...current.clips,
                  ];

                  [
                    clips[index],
                    clips[index + 1],
                  ] = [
                      clips[index + 1],
                      clips[index],
                    ];

                  return {
                    ...current,
                    clips,
                    updatedAt:
                      new Date().toISOString(),
                  };
                })
              }
            />

            <CompositionInspector
              clip={selectedClip}
              mediaItems={mediaItems}
              disabled={!selectedClip}
              onChange={changeSelectedClip}
            />

            <VisualTrimEditor
              clip={selectedClip}
              media={selectedClipMedia}
              disabled={!selectedClip}
              projectStart={
                selectedTimelineClip?.projectStart || 0
              }
              onChange={changeSelectedClip}
              onSeekProjectTime={seek}
            />

            <MediaTransformInspector
              clip={selectedClip}
              media={selectedClipMedia}
              disabled={!selectedClip}
              onChange={changeSelectedClip}
              onReset={() =>
                changeSelectedClip({
                  mediaX: 50,
                  mediaY: 50,
                  mediaScale: 100,
                  mediaRotation: 0,
                  mediaOpacity: 100,
                  mediaBorderRadius: 0,
                })
              }
            />

            <SceneMediaInspector
              clip={selectedClip}
              media={selectedClipMedia}
              mediaItems={mediaItems}
              disabled={!selectedClip}
              onReplace={replaceSelectedClipMedia}
              onChange={changeSelectedClip}
            />
            </>}

            {activeTool === "stickers" && <div ref={stickerSectionRef}>
              <StickerLibrary
                disabled={!project.clips.length}
                onAdd={addSticker}
              />
            </div>}

            {activeTool === "layers" && <LayersManager
              layers={layers}
              selectedLayerId={selectedLayerId}
              disabled={!layers.length}
              onSelect={setSelectedLayerId}
              onToggleHidden={(layerId) =>
                setLayers((current) =>
                  updateLayer(
                    current,
                    layerId,
                    {
                      hidden:
                        !current.find(
                          (layer) =>
                            layer.id ===
                            layerId
                        )?.hidden,
                    }
                  )
                )
              }
              onToggleLocked={(layerId) =>
                setLayers((current) =>
                  updateLayer(
                    current,
                    layerId,
                    {
                      locked:
                        !current.find(
                          (layer) =>
                            layer.id ===
                            layerId
                        )?.locked,
                    }
                  )
                )
              }
              onMoveForward={(layerId) =>
                setLayers((current) =>
                  moveLayerForward(
                    current,
                    layerId
                  )
                )
              }
              onMoveBackward={(layerId) =>
                setLayers((current) =>
                  moveLayerBackward(
                    current,
                    layerId
                  )
                )
              }
              onBringFront={(layerId) =>
                setLayers((current) =>
                  bringLayerToFront(
                    current,
                    layerId
                  )
                )
              }
              onSendBack={(layerId) =>
                setLayers((current) =>
                  sendLayerToBack(
                    current,
                    layerId
                  )
                )
              }
              onDuplicate={(layerId) => {
                setLayers((current) =>
                  duplicateLayer(
                    current,
                    layerId,
                    finalDuration
                  )
                );
              }}
              onDelete={(layerId) => {
                setLayers((current) =>
                  deleteLayer(
                    current,
                    layerId
                  )
                );

                if (
                  selectedLayerId ===
                  layerId
                ) {
                  setSelectedLayerId("");
                }
              }}
            />}

            {activeTool === "text" && <>
            <StickerInspector
              layer={selectedLayer}
              disabled={
                selectedLayer?.type !==
                "sticker"
              }
              projectDuration={
                finalDuration
              }
              onChange={changeSelectedLayer}
              onDuplicate={() =>
                setLayers((current) =>
                  duplicateLayer(
                    current,
                    selectedLayerId,
                    finalDuration
                  )
                )
              }
              onDelete={() => {
                setLayers((current) =>
                  deleteLayer(
                    current,
                    selectedLayerId
                  )
                );

                setSelectedLayerId("");
              }}
            />

            <TextProInspector
              layer={
                selectedLayer?.type === "text" ||
                  selectedLayer?.type === "subtitle"
                  ? selectedLayer
                  : null
              }
              disabled={!selectedLayer}
              onChange={changeSelectedLayer}
              onDuplicate={() =>
                setLayers((current) =>
                  duplicateLayer(
                    current,
                    selectedLayerId,
                    project.sourceDuration
                  )
                )
              }
              onDelete={() => {
                setLayers((current) =>
                  deleteLayer(
                    current,
                    selectedLayerId
                  )
                );

                setSelectedLayerId("");
              }}
            />

            <MotionInspector
              layer={selectedLayer}
              disabled={!project.clips.length}
              onChange={changeSelectedLayer}
            />
            </>}

            {activeTool === "transition" && <div ref={transitionSectionRef}>
              <TransitionInspector
                clip={selectedClip}
                isLast={
                  project.clips.findIndex(
                    (clip) =>
                      clip.id === project.selectedClipId
                  ) ===
                  project.clips.length - 1
                }
                disabled={!project.clips.length}
                onChange={(changes) =>
                  setProject((current) => ({
                    ...current,
                    clips: current.clips.map((clip) =>
                      clip.id === current.selectedClipId
                        ? {
                          ...clip,
                          ...changes,
                        }
                        : clip
                    ),
                  }))
                }
                onPreview={() => {
                  const timelineClip =
                    projectTimeline.find(
                      (item) =>
                        item.id ===
                        project.selectedClipId
                    );

                  if (!timelineClip) {
                    return;
                  }

                  const transitionDuration =
                    Math.max(
                      0.15,
                      Number(
                        selectedClip?.transitionDuration ||
                        0.45
                      )
                    );

                  const previewStart =
                    Math.max(
                      timelineClip.projectStart,
                      timelineClip.projectEnd -
                      transitionDuration -
                      0.35
                    );

                  seek(previewStart);
                  setPlaying(true);
                }}
              />
            </div>}

            {activeTool === "scene" && <ClipInspector
              clip={selectedClip}
              sourceDuration={Math.max(
                0.1,
                Number(
                  selectedClipMedia?.duration ||
                  selectedClip?.sourceDuration ||
                  (selectedClip
                    ? selectedClip.end - selectedClip.start
                    : 0.1)
                )
              )}
              disabled={!project.clips.length}
              onChange={(changes) => {
                setProject((current) => ({
                  ...current,
                  clips: updateClip(
                    current.clips,
                    current.selectedClipId,
                    changes
                  ),
                }));

                const timelineClip =
                  projectTimeline.find(
                    (clip) =>
                      clip.id ===
                      project.selectedClipId
                  );

                if (
                  timelineClip &&
                  changes.start != null
                ) {
                  seek(
                    timelineClip.projectStart
                  );
                } else if (
                  timelineClip &&
                  changes.end != null
                ) {
                  seek(
                    timelineClip.projectEnd
                  );
                }
              }}
              onDuplicate={() =>
                setProject((current) => ({
                  ...current,
                  clips: duplicateClip(
                    current.clips,
                    current.selectedClipId
                  ),
                }))
              }
              onDelete={() => {
                const next = deleteClip(
                  project.clips,
                  project.selectedClipId
                );

                setProject((current) => ({
                  ...current,
                  clips: next,
                  selectedClipId: next[0]?.id || "",
                }));

                if (next[0]) seek(next[0].start);
              }}
            />}
          </aside>
        </div>
      </div>
    </div>
  );
}
