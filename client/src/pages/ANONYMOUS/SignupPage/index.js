import { useEffect, useState } from "react"
import { Col, Row, Form, Steps } from "antd"
import UserService from "src/services/UserService"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { globalSelector } from "src/redux/selector"
import { SignupContainerStyled } from "./styled"
import FormInfor from "./components/FormInfor"
import FormSelectRole from "./components/FormSelectRole"

const SignupPage = () => {

  const [form] = Form.useForm()
  const [loading, setLoading] = useState()
  const [current, setCurrent] = useState(0)
  const [isAgree, setIsAgree] = useState(false)
  const [data, setData] = useState()
  const global = useSelector(globalSelector)
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      setLoading(true)
      let res = {}
      if (!!data?.IsByGoogle) {
        res = await UserService.registerByGoogle(data)
      } else {
        res = await UserService.register(data)
      }
      if (res?.isError) return toast.error(res?.msg)
      toast.success(res?.msg)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: 'Form infor',
      content: <FormInfor
        current={current}
        setCurrent={setCurrent}
        setData={setData}
        form={form}
      />
    },
    {
      title: 'Form select role',
      content: <FormSelectRole
        current={current}
        setCurrent={setCurrent}
        isAgree={isAgree}
        setIsAgree={setIsAgree}
        loading={loading}
        handleRegister={handleRegister}
        data={data}
        setData={setData}
      />
    }
  ]

  const items = steps.map((item) => ({
    key: item.title,
  }))

  useEffect(() => {
    if (!!global?.user?._id) navigate('/')
  }, [])

  return (
    <SignupContainerStyled>
      <Steps
        current={current}
        items={items}
        progressDot={true}
      />
      <Form form={form} className="mt-30">
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <div className="text-center mb-20">
              <p className="fs-25 fw-600">Sign up to use</p>
            </div>
          </Col>
          {steps[current].content}
        </Row>
      </Form>
    </SignupContainerStyled>
  )
}

export default SignupPage