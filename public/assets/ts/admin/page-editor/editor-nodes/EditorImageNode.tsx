import React, { useContext, useEffect, useRef, useState } from "react";
import { EditorNodeProps, EditorNodeTemplate } from "./EditorNodeTemplate";
import { EditorContext } from "../EditorV2";
import { ImageUploader } from "../../image-uploader";

// @todo use a single source for this type, at least across the frontend
type Image = {
  fileName: string;
  path: string;
  publicLink: string;
  fileType: string;
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

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((imageList: Image[]) => {
        setImages(imageList);
      });
  }, []);

  const onSelect = (imageLink: string) => {
    selectImage(imageLink);
    closeModal();
  };

  return (
    <div id="editor-image-upload-modal-bg" onClick={closeModal}>
      <div
        id="editor-image-upload-modal-container"
        onClick={(e) => e.stopPropagation()} // don't close every time the modal is clicked
      >
        <h2>Select an image</h2>
        <div id="image-list">
          {images.map((image) => (
            <button
              className="image-button"
              key={image.publicLink}
              onClick={() => onSelect(image.publicLink)}
            >
              <img src={image.publicLink} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
