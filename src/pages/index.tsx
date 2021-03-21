import React, { useState, ChangeEvent } from 'react'
import { NextPage } from 'next'
import axios from 'axios'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import PhotoCamera from '@material-ui/icons/PhotoCamera'

import { ResponseBody as ImageUploadResponseBody } from './api/puzzle'
import Puzzle from '../components/puzzle'

const Home: NextPage = () => {
  const [data, setData] = useState<ImageUploadResponseBody>({})

  const handleFileUpload = async (e: ChangeEvent) => {
    const file = (e.target as HTMLInputElement).files[0]
    if (!file) {
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await axios.post<ImageUploadResponseBody>(
        '/api/puzzle',
        formData,
        {
          headers: {
            'content-type': 'multipart/form-data',
          },
        }
      )
      setData(data)
    } catch (e) {
      console.error(`[Error occured] ${e.message}`)
    }
  }

  return (
    <Container maxWidth="sm">
      <Grid container justify="center">
        <Typography variant="h4" component="h1" gutterBottom>
          クロスワードジェネレータ
        </Typography>
        <input
          type="file"
          accept="image/jpg,image/png"
          hidden
          id="contained-button-file"
          onChange={handleFileUpload}
        />
        <label htmlFor="contained-button-file">
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<PhotoCamera />}
          >
            画像のアップロード
          </Button>
        </label>
        <Box>
          <img src={data.image} />
        </Box>
        <Puzzle data={data.data}></Puzzle>
      </Grid>
    </Container>
  )
}

export default Home
