import { Button, Col, Form, Row, Select, Upload, message } from "antd"
import { useEffect, useState } from "react"
import ButtonCustom from "src/components/ButtonCustom/MyButton"
import InputCustom from "src/components/FloatInput/InputCustom"
import ModalCustom from "src/components/ModalCustom"
import { BsFillTrash3Fill } from "react-icons/bs"
import ComicService from "src/services/ComicService"
import ImageService from "src/services/ImageService"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import { globalSelector } from "src/redux/selector"
import { getBase64 } from "src/lib/getFileUpload"
import PreviewImage from "./PreviewImage"
import NotificaitonService from "src/services/NotificationService"
import socket from "src/utils/socket"

const { Option } = Select

const InsertUpdateComic = ({
  open,
  onCancel,
  onOk,
}) => {

  const [form] = Form.useForm()
  const global = useSelector(globalSelector)
  const [lstChapters, setLstChapters] = useState([])
  const [deleteDocs, setDeleteDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState()
  const [previewImage, setPreviewImage] = useState()

  const handleDelete = (ChapterID) => {
    const newData = lstChapters.filter(i => i?.ChapterID !== ChapterID)
    setLstChapters(newData)
  }

  const handleBeforeUpload = async (file, type) => {
    const isAllowedType = file.type.includes("image")
    if (!isAllowedType) {
      message.error("Yêu cầu chọn file tài liệu (doc, docx, pdf, xls, xlsx)")
    } else {
      if (type === 'Avatar') {
        setPreview(URL.createObjectURL(file))
      }
    }
    return isAllowedType ? false : Upload.LIST_IGNORE
  }

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
  }

  const handleChange = ({ fileList: newFileList }, ChapterID) => {
    const chapter = lstChapters.find(i => i?.ChapterID === ChapterID)
    const newData = lstChapters.filter(i => i?.ChapterID !== ChapterID)
    const newChapter = {
      ...chapter,
      ListImages: newFileList
    }
    setLstChapters([...newData, newChapter])
  }

  const handleInsertUpdateComic = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      const body = {
        Title: values?.Title,
        ShortDescription: values?.ShortDescription,
        Genres: values?.Genres,
        Avatar: values?.image?.file,
        Chapters: !!lstChapters.length
          ? lstChapters?.map(i => ({
            ChapterID: i?.ChapterID,
            Name: i?.Name,
            Reads: i?.Reads
          }))
          : []
      }
      const { Status, ...remainBody } = body
      const resComic = !!open?.Comic?._id
        ? await ComicService.udpateComic({ ...remainBody, ComicID: open?.Comic?._id })
        : await ComicService.insertComic(body)
      if (resComic?.isError) return toast.error(resComic.msg)
      let insertImages = []
      lstChapters.forEach(chapter => {
        values[chapter?.Name]?.fileList.forEach((i, index) => {
          if (!!i?.originFileObj) {
            const promiseInsertImage = ImageService.insertImage({
              Chapter: chapter?.ChapterID,
              Image: i?.originFileObj,
              Comic: resComic?.data,
              SortOrder: index + 1
            })
            insertImages.push(promiseInsertImage)
          }
        })
      })
      await Promise.all(insertImages)
      if (!open?.Comic?._id) {
        const resNoti = await NotificaitonService.createNotification({
          Content: `${global?.user?.FullName} yêu cầu kiểm duyệt truyện ${values?.Title}`,
          Sender: global?.user?._id,
        })
        if (resNoti?.isError) return
        socket.emit('send-notification', { Content: body.Content, Receiver: resNoti?.data?.Receiver, IsSeen: false })
      }
      if (!open?.Comic?._id) {
        toast.success('Hệ thống đã nhận được yêu cầu đăng truyện của bạn và đang chờ Quản trị viên xét duyệt')
      } else {
        toast.success('Truyện đã được cập nhật thành công')
      }
      onOk()
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let chapters = []
    form.setFieldsValue(open?.Comic)
    open?.Comic?.Chapters?.forEach(item => {
      chapters.push({
        ChapterID: item?.ChapterID,
        Name: item?.Name,
        Reads: item?.Reads,
        ListImages: open?.Images?.filter(i => i?.Chapter === item?.ChapterID)
          ?.map(i => (
            {
              ...i,
              url: i?.Image
            }
          ))
      })
    })
    setLstChapters(chapters)
  }, [open])

  const renderFooter = () => {
    return (
      <div className="d-flex-end">
        <ButtonCustom
          className="normal"
          onClick={() => onCancel()}
        >
          Đóng
        </ButtonCustom>
        <Button
          className="greendBorder small"
          onClick={() => setLstChapters([
            ...lstChapters,
            {
              ChapterID: lstChapters.length + 1,
              Name: `Chapter ${lstChapters.length + 1}`,
              ListImages: []
            }
          ])}
        >
          Insert chapter
        </Button>
        <ButtonCustom
          className="small greendBackground ml-12"
          loading={loading}
          onClick={() => handleInsertUpdateComic()}
        >
          Post
        </ButtonCustom>
      </div>
    )
  }

  return (
    <ModalCustom
      open={open}
      onCancel={onCancel}
      title={open?._id ? "Chỉnh sửa truyện" : "Thêm mới truyện"}
      width="80vw"
      footer={renderFooter()}
    >
      <Form form={form}>
        <Row gutter={[16, 0]}>
          <Col span={5}>
            <Form.Item
              name='image'
              className="mb-24"
              rules={[
                {
                  required: form.getFieldValue("AvatarPath") ? false : true,
                  message: "Hãy chọn avatar cho truyện",
                },
              ]}
            >
              <Upload.Dragger
                beforeUpload={file => handleBeforeUpload(file, 'Avatar')}
                style={{ width: '100%', height: '200px' }}
                accept="image/*"
                multiple={false}
                maxCount={1}
                fileList={[]}
              >
                <div >
                  Chọn ảnh cho truyện
                </div>
                <img style={{ width: '100%', height: '180px' }} src={!!preview ? preview : open?.Comic?.AvatarPath} alt="" />
              </Upload.Dragger>
            </Form.Item>
          </Col>
          <Col span={19}>
            <Form.Item
              name="Title"
              rules={[
                { required: true, message: "Hãy nhập vào tên truyện" },
              ]}
            >
              <InputCustom
                isRequired
                label="Title"
              />
            </Form.Item>
            <Form.Item
              name="ShortDescription"
            >
              <InputCustom
                textArea
                style={{ height: '120px' }}
                label="ShortDecription"
              />
            </Form.Item>
            <Form.Item
              name="Genres"
              rules={[
                { required: true, message: "Hãy chọn thể loại truyện" },
              ]}
            >
              <Select
                placeholder="Genre"
                allowClear
                showSearch
                mode="multiple"
              >
                {
                  global?.genres.map(i =>
                    <Option key={i?._id} value={i?._id}>{i?.Title}</Option>
                  )
                }
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            {
              lstChapters.map(i =>
                <Row gutter={[16]}>
                  <Col span={23} style={{ width: '100%' }}>
                    <Form.Item
                      name={i?.Name}
                      className="mb-24"
                    // rules={[
                    //   {
                    //     required: form.getFieldValue("image") ? false : true,
                    //     message: "Hãy chọn file tải lên",
                    //   },
                    // ]}
                    >
                      <Upload.Dragger
                        listType="picture-circle"
                        beforeUpload={file => handleBeforeUpload(file, 'image')}
                        fileList={i?.ListImages}
                        onPreview={handlePreview}
                        onChange={e => handleChange(e, i?.ChapterID)}
                        accept="image/*"
                        className="pointer"
                        multiple="true"
                        onRemove={file => {
                          if (!!file?._id) {
                            setDeleteDocs([...deleteDocs, file])
                          }
                        }}
                      >
                        <div className="d-flex-center" style={{ height: '10px' }}>
                          {i?.Name}
                        </div>
                      </Upload.Dragger>
                    </Form.Item>
                  </Col>
                  <Col span={1}>
                    <ButtonCustom
                      icon={<BsFillTrash3Fill />}
                      onClick={() => handleDelete(i?.ChapterID)}
                    >
                    </ButtonCustom>
                  </Col>

                </Row>
              )
            }
          </Col>
        </Row>
      </Form>
      {
        !!previewImage &&
        <PreviewImage
          open={previewImage}
          onCancel={() => setPreviewImage()}
        />
      }
    </ModalCustom>
  )
}

export default InsertUpdateComic