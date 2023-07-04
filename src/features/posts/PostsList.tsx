import React, { ReactElement, useState } from 'react'
import {
  useGetPostsQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '../api/apiSlice'

type post = {
  id: string | number;
  title: string;
  body: string;
}

interface submitEVT extends React.FormEventHandler<HTMLFormElement> {
  elements: { title: any; body: any; };
  name: any;
  value: any;
}

const PostsList = () => {
  const [addNewPost, response] = useAddNewPostMutation()
  const [deletePost] = useDeletePostMutation()
  const [inputField, setInputField] = useState<post>({
    id: '',
    title: '',
    body: '',
  })
  const inputsHandler = (e: { target: { name: any; value: any; }; }) => {
    setInputField((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const setPostData = (data: post) => {
    setInputField({
      id: data.id,
      title: data.title,
      body: data.body,
    })
  }
  const onEditData = () => {
    updatePost({
      id: inputField.id,
      title: inputField.title,
      body: inputField.body,
    })
    setInputField(() => ({
      id: '',
      title: '',
      body: '',
    }))
  }
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as unknown as submitEVT
    const { title, body } = target.elements
    setInputField((inputField) => ({
      ...inputField,
      [target.name]: target.value,
    }))
    let formData = {
      title: title.value,
      body: body.value,
    }
    addNewPost(formData)
      .unwrap()
      .then(() => {
        setInputField(() => ({
          id: '',
          title: '',
          body: '',
        }))
      })
      .then((error) => {
        console.log(error)
      })
  }
  const {
    data: posts,
    isLoading: isGetLoading,
    isSuccess: isGetSuccess,
    isError: isGetError,
    error: getError,
  } = useGetPostsQuery({ refetchOnMountOrArgChange: true })
  let postContent
  if (isGetLoading) {
    postContent = (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  } else if (isGetSuccess) {
    postContent = posts.map((item: post) => {
      return (
        <div className="col-lg-12 mb-3" key={item.id}>
          <div className="card alert alert-secondary">
            <div className="card-body">
              <h5 className="card-title">{item.title}</h5>
              <p className="card-text">{item.body}</p>
              <button
                onClick={() => deletePost(item.id)}
                className="btn btn-outline-danger me-2"
              >
                Remove
              </button>
              <button
                onClick={() => setPostData(item)}
                className="btn btn-outline-primary"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )
    })
  } else if (isGetError) {
    postContent = (
      <div className="alert alert-danger" role="alert">
        {getError as ReactElement}
      </div>
    )
  }
  return (
    <div className="row">
      <div className="col-md-4 offset-md-*">
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="mb-3">
            <label className="form-label">
              <strong>Enter Title</strong>
            </label>
            <input
              value={inputField.title}
              type="text"
              className="form-control"
              name="title"
              id="title"
              onChange={inputsHandler}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <strong>Enter content</strong>
            </label>
            <textarea
              value={inputField.body}
              className="form-control"
              rows={3}
              name="body"
              id="body"
              onChange={inputsHandler}
            ></textarea>
          </div>
          <button className="btn btn-danger me-2" type="submit">
            Submit
          </button>
          <button
            onClick={onEditData}
            className="btn btn-primary"
            type="button"
          >
            Update
          </button>
        </form>
      </div>
      <div className="col-lg-8">
        <div className="row">{postContent}</div>
      </div>
    </div>
  )
}
export default PostsList