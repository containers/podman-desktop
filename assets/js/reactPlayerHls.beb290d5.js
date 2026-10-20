"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[32262],{

/***/ 39895
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ react_react_default)
});

// EXTERNAL MODULE: ../node_modules/react/index.js
var react = __webpack_require__(63696);
// EXTERNAL MODULE: ../node_modules/custom-media-element/dist/custom-media-element.js
var custom_media_element = __webpack_require__(12495);
// EXTERNAL MODULE: ../node_modules/media-tracks/dist/index.js + 12 modules
var dist = __webpack_require__(39837);
// EXTERNAL MODULE: ../node_modules/hls.js/dist/hls.mjs
var hls = __webpack_require__(152);
;// ../node_modules/hls-video-element/dist/hls-video-element.js



const HlsVideoMixin = (superclass) => {
  return class HlsVideo extends superclass {
    static shadowRootOptions = { ...superclass.shadowRootOptions };
    static getTemplateHTML = (attrs, props = {}) => {
      const { src, ...rest } = attrs;
      return `
        <script type="application/json" id="config">
          ${JSON.stringify(props.config || {})}
        </script>
        ${superclass.getTemplateHTML(rest)}
      `;
    };
    #airplaySourceEl = null;
    #config = null;
    constructor() {
      super();
      this.#upgradeProperty("config");
    }
    get config() {
      return this.#config;
    }
    set config(value) {
      this.#config = value;
    }
    attributeChangedCallback(attrName, oldValue, newValue) {
      if (attrName !== "src") {
        super.attributeChangedCallback(attrName, oldValue, newValue);
      }
      if (attrName === "src" && oldValue != newValue) {
        this.load();
      }
    }
    #destroy() {
      var _a, _b;
      (_a = this.#airplaySourceEl) == null ? void 0 : _a.remove();
      (_b = this.nativeEl) == null ? void 0 : _b.removeEventListener(
        "webkitcurrentplaybacktargetiswirelesschanged",
        this.#toggleHlsLoad
      );
      if (this.api) {
        this.api.detachMedia();
        this.api.destroy();
        this.api = null;
      }
    }
    async load() {
      var _a, _b;
      const isFirstLoad = !this.api;
      this.#destroy();
      if (!this.src) {
        return;
      }
      if (isFirstLoad && !this.#config) {
        this.#config = JSON.parse(((_a = this.shadowRoot.getElementById("config")) == null ? void 0 : _a.textContent) || "{}");
      }
      if (hls/* default.isSupported */.Ay.isSupported()) {
        await Promise.resolve();
        this.api = new hls/* default */.Ay({
          // Mimic the media element with an Infinity duration for live streams.
          liveDurationInfinity: true,
          // Disable auto quality level/fragment loading.
          autoStartLoad: false,
          // Custom configuration for hls.js.
          ...this.config
        });
        this.api.loadSource(this.src);
        this.api.attachMedia(this.nativeEl);
        switch (this.nativeEl.preload) {
          case "none": {
            const loadSourceOnPlay = () => this.api.startLoad();
            this.nativeEl.addEventListener("play", loadSourceOnPlay, {
              once: true
            });
            this.api.on(hls/* default.Events */.Ay.Events.DESTROYING, () => {
              this.nativeEl.removeEventListener("play", loadSourceOnPlay);
            });
            break;
          }
          case "metadata": {
            const originalLength = this.api.config.maxBufferLength;
            const originalSize = this.api.config.maxBufferSize;
            this.api.config.maxBufferLength = 1;
            this.api.config.maxBufferSize = 1;
            const increaseBufferOnPlay = () => {
              this.api.config.maxBufferLength = originalLength;
              this.api.config.maxBufferSize = originalSize;
            };
            this.nativeEl.addEventListener("play", increaseBufferOnPlay, {
              once: true
            });
            this.api.on(hls/* default.Events */.Ay.Events.DESTROYING, () => {
              this.nativeEl.removeEventListener("play", increaseBufferOnPlay);
            });
            this.api.startLoad();
            break;
          }
          default:
            this.api.startLoad();
        }
        if (this.nativeEl.webkitCurrentPlaybackTargetIsWireless) {
          this.api.stopLoad();
        }
        this.nativeEl.addEventListener(
          "webkitcurrentplaybacktargetiswirelesschanged",
          this.#toggleHlsLoad
        );
        this.#airplaySourceEl = document.createElement("source");
        this.#airplaySourceEl.setAttribute("type", "application/x-mpegURL");
        this.#airplaySourceEl.setAttribute("src", this.src);
        this.nativeEl.disableRemotePlayback = false;
        this.nativeEl.append(this.#airplaySourceEl);
        const levelIdMap = /* @__PURE__ */ new WeakMap();
        this.api.on(hls/* default.Events */.Ay.Events.MANIFEST_PARSED, (event, data) => {
          if (this.nativeEl.autoplay && this.nativeEl.paused) {
            this.nativeEl.play().catch((err) => {
              console.warn("Autoplay failed:", err);
            });
          }
          removeAllMediaTracks();
          let videoTrack = this.videoTracks.getTrackById("main");
          if (!videoTrack) {
            videoTrack = this.addVideoTrack("main");
            videoTrack.id = "main";
            videoTrack.selected = true;
          }
          for (const [id, level] of data.levels.entries()) {
            const videoRendition = videoTrack.addRendition(
              level.url[0],
              level.width,
              level.height,
              level.videoCodec,
              level.bitrate
            );
            levelIdMap.set(level, `${id}`);
            videoRendition.id = `${id}`;
          }
          for (let [id, a] of data.audioTracks.entries()) {
            const kind = a.default ? "main" : "alternative";
            const audioTrack = this.addAudioTrack(kind, a.name, a.lang);
            audioTrack.id = `${id}`;
            if (a.default) {
              audioTrack.enabled = true;
            }
          }
        });
        this.audioTracks.addEventListener("change", () => {
          var _a2;
          const audioTrackId = +((_a2 = [...this.audioTracks].find((t) => t.enabled)) == null ? void 0 : _a2.id);
          const availableIds = this.api.audioTracks.map((t) => t.id);
          if (audioTrackId != this.api.audioTrack && availableIds.includes(audioTrackId)) {
            this.api.audioTrack = audioTrackId;
          }
        });
        this.api.on(hls/* default.Events */.Ay.Events.LEVELS_UPDATED, (event, data) => {
          const videoTrack = this.videoTracks[this.videoTracks.selectedIndex ?? 0];
          if (!videoTrack) return;
          const levelIds = data.levels.map((l) => levelIdMap.get(l));
          for (const rendition of this.videoRenditions) {
            if (rendition.id && !levelIds.includes(rendition.id)) {
              videoTrack.removeRendition(rendition);
            }
          }
        });
        let lastFailedLevel = null;
        this.api.on(hls/* default.Events */.Ay.Events.ERROR, (event, data) => {
          if (data.type === hls/* default.ErrorTypes */.Ay.ErrorTypes.NETWORK_ERROR && data.details === hls/* default.ErrorDetails */.Ay.ErrorDetails.FRAG_LOAD_ERROR) {
            lastFailedLevel = data.frag.level;
          }
        });
        this.api.on(hls/* default.Events */.Ay.Events.LEVEL_SWITCHED, (event, data) => {
          const newLevel = data.level;
          if (lastFailedLevel !== null && newLevel < lastFailedLevel) {
            console.warn(
              `\u26A0\uFE0F hls.js downgraded quality from level ${lastFailedLevel} to ${newLevel} due to fragment load failure.`
            );
            this.videoRenditions.selectedIndex = newLevel;
            lastFailedLevel = null;
          }
        });
        const switchRendition = (event) => {
          const level = event.target.selectedIndex;
          if (level != this.api.nextLevel) {
            this.api.nextLevel = level;
          }
        };
        (_b = this.videoRenditions) == null ? void 0 : _b.addEventListener("change", switchRendition);
        const removeAllMediaTracks = () => {
          for (const videoTrack of this.videoTracks) {
            this.removeVideoTrack(videoTrack);
          }
          for (const audioTrack of this.audioTracks) {
            this.removeAudioTrack(audioTrack);
          }
        };
        this.api.once(hls/* default.Events */.Ay.Events.DESTROYING, removeAllMediaTracks);
        return;
      }
      await Promise.resolve();
      if (this.nativeEl.canPlayType("application/vnd.apple.mpegurl")) {
        this.nativeEl.src = this.src;
      }
    }
    #toggleHlsLoad = () => {
      var _a, _b, _c;
      if ((_a = this.nativeEl) == null ? void 0 : _a.webkitCurrentPlaybackTargetIsWireless) {
        (_b = this.api) == null ? void 0 : _b.stopLoad();
      } else {
        (_c = this.api) == null ? void 0 : _c.startLoad();
      }
    };
    // This is a pattern to update property values that are set before
    // the custom element is upgraded.
    // https://web.dev/custom-elements-best-practices/#make-properties-lazy
    #upgradeProperty(prop) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  };
};
const HlsVideoElement = HlsVideoMixin((0,dist/* MediaTracksMixin */.u6)(custom_media_element/* CustomVideoElement */.lB));
if (globalThis.customElements && !globalThis.customElements.get("hls-video")) {
  globalThis.customElements.define("hls-video", HlsVideoElement);
}
var hls_video_element_default = HlsVideoElement;


;// ../node_modules/hls-video-element/dist/react.js
"use client";

// dist/react.ts



// ../../node_modules/ce-la-react/dist/ce-la-react.js
var reservedReactProps = /* @__PURE__ */ new Set([
  "style",
  "children",
  "ref",
  "key",
  "suppressContentEditableWarning",
  "suppressHydrationWarning",
  "dangerouslySetInnerHTML"
]);
var reactPropToAttrNameMap = {
  className: "class",
  htmlFor: "for"
};
function defaultToAttributeName(propName) {
  return propName.toLowerCase();
}
function defaultToAttributeValue(propValue) {
  if (typeof propValue === "boolean") return propValue ? "" : void 0;
  if (typeof propValue === "function") return void 0;
  if (typeof propValue === "object" && propValue !== null) return void 0;
  return propValue;
}
function createComponent({
  react: React2,
  tagName,
  elementClass,
  events,
  displayName,
  defaultProps,
  toAttributeName = defaultToAttributeName,
  toAttributeValue = defaultToAttributeValue
}) {
  const IS_REACT_19_OR_NEWER = Number.parseInt(React2.version) >= 19;
  const ReactComponent = React2.forwardRef((props, ref) => {
    var _a, _b;
    const elementRef = React2.useRef(null);
    const prevElemPropsRef = React2.useRef(/* @__PURE__ */ new Map());
    const eventProps = {};
    const attrs = {};
    const reactProps = {};
    const elementProps = {};
    for (const [k, v] of Object.entries(props)) {
      if (reservedReactProps.has(k)) {
        reactProps[k] = v;
        continue;
      }
      const attrName = toAttributeName(reactPropToAttrNameMap[k] ?? k);
      if (elementClass.prototype && k in elementClass.prototype && !(k in (((_a = globalThis.HTMLElement) == null ? void 0 : _a.prototype) ?? {})) && !((_b = elementClass.observedAttributes) == null ? void 0 : _b.some((attr) => attr === attrName))) {
        elementProps[k] = v;
        continue;
      }
      if (k.startsWith("on")) {
        eventProps[k] = v;
        continue;
      }
      const attrValue = toAttributeValue(v);
      if (attrName && attrValue != null) {
        attrs[attrName] = String(attrValue);
        if (!IS_REACT_19_OR_NEWER) {
          reactProps[attrName] = attrValue;
        }
      }
      if (attrName && IS_REACT_19_OR_NEWER) {
        const attrValueFromDefault = defaultToAttributeValue(v);
        if (attrValue !== attrValueFromDefault) {
          reactProps[attrName] = attrValue;
        } else {
          reactProps[attrName] = v;
        }
      }
    }
    if (typeof window !== "undefined") {
      for (const propName in eventProps) {
        const callback = eventProps[propName];
        const useCapture = propName.endsWith("Capture");
        const eventName = ((events == null ? void 0 : events[propName]) ?? propName.slice(2).toLowerCase()).slice(
          0,
          useCapture ? -7 : void 0
        );
        React2.useLayoutEffect(() => {
          const eventTarget = elementRef == null ? void 0 : elementRef.current;
          if (!eventTarget || typeof callback !== "function") return;
          eventTarget.addEventListener(eventName, callback, useCapture);
          return () => {
            eventTarget.removeEventListener(eventName, callback, useCapture);
          };
        }, [elementRef == null ? void 0 : elementRef.current, callback]);
      }
      React2.useLayoutEffect(() => {
        if (elementRef.current === null) return;
        const newElemProps = /* @__PURE__ */ new Map();
        for (const key in elementProps) {
          setProperty(elementRef.current, key, elementProps[key]);
          prevElemPropsRef.current.delete(key);
          newElemProps.set(key, elementProps[key]);
        }
        for (const [key, _value] of prevElemPropsRef.current) {
          setProperty(elementRef.current, key, void 0);
        }
        prevElemPropsRef.current = newElemProps;
      });
    }
    if (typeof window === "undefined" && (elementClass == null ? void 0 : elementClass.getTemplateHTML) && (elementClass == null ? void 0 : elementClass.shadowRootOptions)) {
      const { mode, delegatesFocus } = elementClass.shadowRootOptions;
      const templateShadowRoot = React2.createElement("template", {
        shadowrootmode: mode,
        shadowrootdelegatesfocus: delegatesFocus,
        dangerouslySetInnerHTML: {
          __html: elementClass.getTemplateHTML(attrs, props)
        }
      });
      reactProps.children = [templateShadowRoot, reactProps.children];
    }
    return React2.createElement(tagName, {
      ...defaultProps,
      ...reactProps,
      ref: React2.useCallback(
        (node) => {
          elementRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref !== null) {
            ref.current = node;
          }
        },
        [ref]
      )
    });
  });
  ReactComponent.displayName = displayName ?? elementClass.name;
  return ReactComponent;
}
function setProperty(node, name, value) {
  var _a;
  node[name] = value;
  if (value == null && name in (((_a = globalThis.HTMLElement) == null ? void 0 : _a.prototype) ?? {})) {
    node.removeAttribute(name);
  }
}

// dist/react.ts
var react_react_default = createComponent({
  react: react,
  tagName: "hls-video",
  elementClass: hls_video_element_default,
  toAttributeName(propName) {
    if (propName === "muted") return "";
    if (propName === "defaultMuted") return "muted";
    return defaultToAttributeName(propName);
  }
});

/*! Bundled license information:

ce-la-react/dist/ce-la-react.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *
   * Modified version of `@lit/react` for vanilla custom elements with support for SSR.
   *)
*/


/***/ }

}]);