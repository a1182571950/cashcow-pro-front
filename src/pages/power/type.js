import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Table, Row, Col } from "antd";
import TypeModal from "@/components/modal/type";
import { getPower } from "@/api";
import "./index.less";
export default function Types() {
  const [showModal, setShow] = useState(false);
  const [tableData, setData] = useState([]);
  const [tableCol, setCol] = useState([]);
  const [choose, setChoose] = useState(null);
  useEffect(() => {
    getTypeData();
    // eslint-disable-next-line
  }, []);
  const modalControl = useCallback((info, open) => {
    setChoose(info);
    setShow(open);
  }, []);
  const activeCol = useMemo(
    () => ({
      dataIndex: "active",
      key: "active",
      title: "操作",
      align: "center",
      render: (text, record) => (
        <Button type="link" onClick={() => modalControl(record, true)}>
          编辑
        </Button>
      ),
    }),
    [modalControl]
  );
  const renderTitle = useCallback(
    () => (
      <Row justify="space-between" align="center" gutter={80}>
        <Col style={{ lineHeight: "32px" }}>用户信息列表</Col>
        <Col>
          <Button type="primary" onClick={() => modalControl(null, true)}>
            添加管理权限
          </Button>
        </Col>
      </Row>
    ),
    [modalControl]
  );
  const getTypeData = useCallback(() => {
    getPower().then((res) => {
      if (res.status === 0) {
        res.mapKey.push(activeCol);
        setData(res.data);
        setCol(res.mapKey);
      }
    });
  }, [activeCol]);
  return (
    <div className="type-container">
      <Table
        rowKey="type"
        title={renderTitle}
        columns={tableCol}
        dataSource={tableData}
      />
      <TypeModal
        isShow={showModal}
        info={choose}
        onCancel={modalControl}
        onOk={getTypeData}
      />
    </div>
  );
}
