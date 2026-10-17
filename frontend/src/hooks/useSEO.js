import { useEffect } from "react";

const useSEO = ({
  title,
  description,
  canonicalUrl,
}) => {
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

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", "website");

    if (canonicalUrl) {
      let canonical = document.head.querySelector(
        'link[rel="canonical"]',
      );

      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }

      canonical.setAttribute("href", canonicalUrl);
    }
  }, [title, description, canonicalUrl]);
};

export default useSEO;