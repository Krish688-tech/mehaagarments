import { useEffect } from "react";

const useSEO = ({ title, description, canonicalUrl }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMeta = (attribute, key, content) => {
      if (!content) return;

      let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`,
      );

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    const normalizedCanonical = canonicalUrl
      ? (() => {
          const url = new URL(canonicalUrl);
          url.hostname = "www.mehaagarments.in";
          url.protocol = "https:";
          return url.href;
        })()
      : undefined;

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", normalizedCanonical);
    setMeta("property", "og:type", "website");

    if (normalizedCanonical) {
      let canonical = document.head.querySelector(
        'link[rel="canonical"]',
      );

      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }

      canonical.setAttribute("href", normalizedCanonical);
    }
  }, [title, description, canonicalUrl]);
};

export default useSEO;
