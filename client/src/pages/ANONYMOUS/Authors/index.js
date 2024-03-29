import { Button, Card, Col, Row } from "antd"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ButtomCustomStyled } from "src/components/ButtonCustom/MyButton/styled"
import InputCustom from "src/components/FloatInput/InputCustom"
import SpinCustom from "src/components/SpinCustom"
import UserService from "src/services/UserService"
import { StyledMeta } from "./styled"

const { Meta } = Card
const Authors = () => {
  const [loading, setLoading] = useState(false)
  const [listData, setListData] = useState([])
  const navigate = useNavigate()
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({
    TextSearch: "",
    CurrentPage: 1,
    PageSize: 10,
  })

  const getList = async () => {
    try {
      setLoading(true)
      const res = await UserService.getListAuthour(pagination)
      if (res.isError) return
      setListData(res?.data?.List)
      setTotal(res?.data?.Total)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getList()
  }, [pagination])


  return (
    <SpinCustom spinning={loading}>
      <Row gutter={[16, 16]} className="mt-20 mb-20">
        <Col span={24}>
          <p className="title-type-1">Danh sách tác giả</p>
        </Col>
        <Col span={24} >
          <InputCustom
            search
            allowClear
            label="Tìm kiến tác giả theo tên"
            onSearch={value => {
              setPagination(pre => ({
                ...pre,
                CurrentPage: 1,
                TextSearch: value,
              }))
            }}
          />
        </Col>
        {listData.map(i =>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <Card
              hoverable
              style={{
                width: 240,
              }}
              onClick={() => navigate(`/author/${i?._id}`)}
              cover={<img alt="example" src={i.AvatarPath} />}
            >
              <StyledMeta>
                <Meta title={i.FullName} description={i.Description} />
              </StyledMeta>
            </Card>
          </Col>
        )}
        {/* <Col span={24}>
          <TableCustom
            isPrimary
            columns={columns}
            dataSource={listData}
            bordered
            // onRow={record => {
            //   return {
            //     onClick: () => {
            //       setOpenModalView(record)
            //     },
            //   }
            // }}
            noMrb
            showPagination
            editableCell
            sticky={{ offsetHeader: -12 }}
            // textEmpty="Không có dữ liệu"
            rowKey="key"
            pagination={{
              hideOnSinglePage: total <= 10,
              current: pagination?.CurrentPage,
              pageSize: pagination?.PageSize,
              responsive: true,
              total: total,
              locale: { items_per_page: "" },
              showSizeChanger: total > 10,
              onChange: (CurrentPage, PageSize) =>
                setPagination({
                  ...pagination,
                  CurrentPage,
                  PageSize,
                }),
            }}
          />
        </Col> */}
      </Row>
    </SpinCustom>
  )
}
export default Authors