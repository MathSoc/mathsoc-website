import React, { useContext, useEffect, useRef, useState } from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { ImageUploader } from "../../image-uploader";
import Fuse from "fuse.js";

// @todo use a single source for this type, at least across the frontend
type Image = {
  fileName: string;
  path: string;
  publicLink: string;
  fileType: string;
};

const RECENT_IMAGES_KEY = "recentImages";
const RECENT_IMAGES_LIMIT = 5;

const getRecentImages = (allImages: Image[]): Image[] => {
  const stored = localStorage.getItem(RECENT_IMAGES_KEY);
  if (!stored) return [];
  try {
    const recentLinks: string[] = JSON.parse(stored);
    return recentLinks
      .map((link) => allImages.find((img) => img.publicLink === link))
      .filter(Boolean) as Image[];
  } catch {
    return [];
  }
};

const addRecentImage = (publicLink: string) => {
  const stored = localStorage.getItem(RECENT_IMAGES_KEY);
  let recent: string[] = [];
  if (stored) {
    try {
      recent = JSON.parse(stored);
    } catch {}
  }
  recent = recent.filter((link) => link !== publicLink);
  recent.unshift(publicLink);
  if (recent.length > RECENT_IMAGES_LIMIT)
    recent = recent.slice(0, RECENT_IMAGES_LIMIT);
  localStorage.setItem(RECENT_IMAGES_KEY, JSON.stringify(recent));
};

export const EditorImageNode: React.FC<EditorNodeProps> = (props) => {
  const { path } = props;
  const { getDataValue, setDataValue } = useContext(EditorContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageSource = getDataValue(path);

  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  const openUpload = () => {
    imageUploadInputRef.current?.click();
  };

  const selectImage = (imageName: string) => {
    setDataValue(path, imageName);
  };

  const handleFileSelect = async () => {
    const file = imageUploadInputRef.current?.files;
    if (!file) {
      return;
    }

    const fileName = (await ImageUploader.uploadImages(file))[0];
    selectImage(`/assets/img/uploads/${fileName}`);
  };

  const clearImage = () => {
    setDataValue(path, "");
  };

  return (
    <EditorNodeTemplate key={path.join("-")} {...props}>
      <div className="editor-image-node-inner">
        <div className="editor-image-node-buttons">
          <img className="image-node-item" src={imageSource} />
          <button
            className="image-node-item"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            Select new image
          </button>
          <button className="image-node-item" onClick={openUpload}>
            Upload new image
          </button>
          <button className="image-node-item" onClick={clearImage}>
            Deselect image
          </button>
        </div>
        <input
          type="file"
          className="hidden-file-uploader"
          ref={imageUploadInputRef}
          onChange={handleFileSelect}
          accept="image/*"
        />
      </div>
      {isModalOpen ? (
        <UploadImageModal
          selectImage={selectImage}
          closeModal={() => setIsModalOpen(false)}
        />
      ) : null}
    </EditorNodeTemplate>
  );
};

const UploadImageModal: React.FC<{
  selectImage: (imageLink: string) => void;
  closeModal: () => void;
}> = ({ selectImage, closeModal }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<Image> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentImages, setRecentImages] = useState<Image[]>([]);

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((imageList: Image[]) => {
        setImages(imageList);
        setFilteredResults(imageList.map((img) => ({ item: img })));
        setFuse(
          new Fuse(imageList, {
            keys: ["fileName"],
            threshold: 0.4,
            includeMatches: true,
          })
        );
        setRecentImages(getRecentImages(imageList));
      });
  }, []);

  const onSelect = (imageLink: string) => {
    selectImage(imageLink);
    addRecentImage(imageLink);
    closeModal();
  };

  const filterImages = (query: string) => {
    setSearchQuery(query);
    if (!fuse || query === "") {
      setFilteredResults(images.map((img) => ({ item: img })));
    } else {
      const results = fuse.search(query);
      setFilteredResults(results);
    }
  };

  const searchImages = (event) => {
    filterImages(event.target.value.trim());
  };

  return (
    <div id="editor-image-upload-modal-bg" onClick={closeModal}>
      <div
        id="editor-image-upload-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {recentImages.length > 0 && (
          <div id="recent-images-section" style={{ marginBottom: 24 }}>
            <h4>Recent Images</h4>
            <div style={{ display: "flex", gap: 16 }}>
              {recentImages.map((image) => (
                <button
                  className="image-button"
                  key={image.publicLink + "-recent"}
                  onClick={() => onSelect(image.publicLink)}
                >
                  <img
                    src={image.publicLink}
                    style={{ maxWidth: 100, maxHeight: 100 }}
                  />
                  <h5>{image.fileName}</h5>
                </button>
              ))}
            </div>
          </div>
        )}
        <div id="modal-actions">
          <h2>Select New Image</h2>
          <input
            type="search"
            id="modal-image-search-input"
            name="modal-image-search-input"
            placeholder="Search for images..."
            onInput={searchImages}
            defaultValue={searchQuery}
          />
        </div>
        <div id="image-list">
          {filteredResults.map((result, idx) => {
            const image = result.item;
            let fileNameContent: React.ReactNode = image.fileName;

            if (searchQuery) {
              const lowerFileName = image.fileName.toLowerCase();
              const lowerQuery = searchQuery.toLowerCase();
              const matchIndex = lowerFileName.indexOf(lowerQuery);

              if (matchIndex !== -1) {
                const before = image.fileName.slice(0, matchIndex);
                const match = image.fileName.slice(
                  matchIndex,
                  matchIndex + searchQuery.length
                );
                const after = image.fileName.slice(
                  matchIndex + searchQuery.length
                );
                fileNameContent = (
                  <>
                    {before}
                    <span className="highlight">{match}</span>
                    {after}
                  </>
                );
              }
            }

            return (
              <button
                className="image-button"
                key={image.publicLink}
                onClick={() => onSelect(image.publicLink)}
              >
                <img src={image.publicLink} />
                <h5>{fileNameContent}</h5>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
