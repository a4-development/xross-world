import React, { useState, ChangeEvent } from 'react'
import { NextPage } from 'next'
import axios from 'axios'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import LinearProgress from '@material-ui/core/LinearProgress'

import { ResponseBody as ImageUploadResponseBody } from './api/puzzle'
import Puzzle from '../components/puzzle'

const Home: NextPage = () => {
  const [data, setData] = useState<ImageUploadResponseBody>({})
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (e: ChangeEvent) => {
    const file = (e.target as HTMLInputElement).files[0]
    if (!file) {
      return
    }
    setLoading(true)
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
      console.error(`[Error occurred] ${e.message}`)
    } finally {
      setLoading(false)
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
            disabled={loading}
          >
            画像のアップロード
          </Button>
        </label>
        {loading && (
          <Container style={{ margin: 16 }}>
            <LinearProgress />
          </Container>
        )}
        <Box>
          <img src={data.image} style={{ width: '100%' }} />
        </Box>
        <Puzzle data={data.data}></Puzzle>
      </Grid>
    </Container>
  )
}

export default Home
