import { useState } from "react";
import { NextPage } from "next"
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { ResponseBody as ImageUploadResponseBody, ResponseBody } from "./api/hello";

const Home: NextPage = () => {

  const [textData, setTextData] = useState('');

  const handleOnDrop = (acceptedFiles: File[]) => {
    acceptedFiles.map(async file => {
      const formData = new FormData();
      formData.append('file', file)
      try {
        const res = await axios.post<ImageUploadResponseBody>('/api/hello', formData, {
          headers: {
            'content-type': 'multipart/form-data'
          }
        })
        setTextData(JSON.stringify(res.data.images))
      } catch (e) {
        console.error(`[Error occured] ${e.message}`)
      }
    })
  }

  return (
    <>
      <Dropzone onDrop={handleOnDrop}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
          </section>
        )}
      </Dropzone>
      <p>{textData}</p>
    </>
  )
}

export default Home;
