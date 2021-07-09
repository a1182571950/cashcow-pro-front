import { useEffect, useState } from "react";
import {
  Table,
  Row,
  Drawer,
  Radio,
  Tooltip,
  InputNumber,
  Button,
  message,
  notification,
} from "antd";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import MyIcon from "../icon";
import arrayMove from "array-move";
import { getKey, setKey } from "@/utils";
import "./index.less";

const DragHandle = sortableHandle(() => (
  <MyIcon type="icon_mirrorlightctrl" className="drag-sort" />
));
const SortableItem = sortableElement((props) => <tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);
const setColTitle = [
  {
    title: "列排序",
    dataIndex: "sort",
    className: "drag-visible",
    render: () => <DragHandle />,
  },
  {
    title: "列名",
    dataIndex: "title",
    className: "drag-visible",
    align: "center",
  },
  {
    title: "宽度",
    dataIndex: "width",
    type: "inputNumber",
  },
  {
    title: "固定",
    dataIndex: "fixed",
    width: 120,
    type: "switch",
    align: "center",
    range: [
      { v: false, t: "关" },
      { v: "left", t: "左固定" },
      { v: "right", t: "右固定" },
    ],
  },
  {
    title: "超出宽度隐藏",
    dataIndex: "ellipsis",
    type: "switch",
    align: "center",
    range: [
      { v: false, t: "否" },
      { v: true, t: "是" },
    ],
  },
  {
    title: "对齐",
    dataIndex: "align",
    type: "switch",
    align: "center",
    range: [
      { v: "left", t: "左" },
      { v: "center", t: "居中" },
      { v: "right", t: "右" },
    ],
  },
  {
    title: "隐藏",
    dataIndex: "hidden",
    type: "switch",
    align: "center",
    range: [
      { v: "hidden", t: "隐藏" },
      { v: "auto", t: "显示" },
    ],
  },
];

const defaultCol = {
  width: 80,
  fixed: false,
  ellipsis: false,
  align: "left",
  hidden: "auto",
};

function UseTable(columns, saveKey) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [col, setCol] = useState([]); // 显示表格
  const [tbTitle, setTitle] = useState([]); // 设置表格
  const DraggableContainer = (props) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );
  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index = col.findIndex((x) => x.index === restProps["data-row-key"]);
    return <SortableItem index={index} {...restProps} />;
  };
  useEffect(() => {
    const data = getKey(true, saveKey);
    if (saveKey && data && columns && columns.length === data.length) {
      const merge = data.map((item) => ({
        ...columns.find((i) => i.dataIndex === item.dataIndex),
        ...item,
      }));
      setCol(merge);
    }
  }, [saveKey, columns]);
  // 初始化表格设置
  useEffect(() => {
    const data = getKey(true, saveKey);
    if (!data && columns && columns.length !== col.length) {
      const newCol = columns.map((c, index) => ({
        ...defaultCol,
        ...c,
        index,
      }));
      setCol(newCol);
    }
    // eslint-disable-next-line
  }, [saveKey, columns]);

  // 表格设置渲染
  useEffect(() => {
    if (col.length !== 0) {
      const newTb = setColTitle.map((c) => {
        if (c.type === "switch") {
          c.render = (...args) => switchRender(c, ...args);
        }
        if (c.type === "inputNumber") {
          c.render = (...args) => inuputRender(c.dataIndex, ...args);
        }
        return c;
      });
      setTitle(newTb);
    }
    // eslint-disable-next-line
  }, [col]);
  function switchRender(column, text, current) {
    return (
      <Radio.Group
        buttonStyle="solid"
        value={text}
        onChange={(e) =>
          switchChange(column.dataIndex, e.target.value, current)
        }
      >
        {column.range &&
          column.range.map((r) => (
            <Row className="mt10" key={r.t} justify="center">
              <Tooltip title={r.t} arrowPointAtCenter>
                <Radio value={r.v}>{r.t}</Radio>
              </Tooltip>
            </Row>
          ))}
      </Radio.Group>
    );
  }

  function switchChange(key, val, current) {
    const dataIndex = current.dataIndex;
    const newCol = col.map((item) => {
      if (item.dataIndex === dataIndex) {
        item[key] = val;
      }
      return item;
    });
    setCol(newCol);
  }

  function inuputRender(dataIndex, text, col) {
    return (
      <Tooltip title="失去焦点触发" arrowPointAtCenter>
        <InputNumber
          min={0}
          max={800}
          onStep={(v)=>switchChange(dataIndex, v, col)}
          onBlur={(v) => switchChange(dataIndex, Number(v.target.value), col)}
          value={text}
        />
      </Tooltip>
    );
  }

  function hiddin() {
    setShowDrawer(false);
  }
  function show() {
    setShowDrawer(true);
  }

  function onSortEnd({ oldIndex, newIndex }) {
    if (oldIndex !== newIndex) {
      const newData = arrayMove([].concat(col), oldIndex, newIndex).filter(
        (el) => !!el
      );
      setCol(newData);
    }
  }
  function saveTbSet() {
    if (!saveKey) {
      return notification.error({
        type: "error",
        description: "你未定义表格的savaKey属性，请定义后保存",
        message: "保存失败",
      });
    }
    setKey(true, saveKey, col);
    message.success("保存设置成功!");
  }
  return {
    col,
    showDrawer,
    show,
    hiddin,
    tbTitle,
    DraggableContainer,
    DraggableBodyRow,
    saveTbSet,
  };
}

function MyTable({
  columns,
  dataSource,
  className,
  children,
  saveKey,
  ...Props
}) {
  const {
    showDrawer,
    show,
    hiddin,
    col,
    tbTitle,
    DraggableContainer,
    DraggableBodyRow,
    saveTbSet,
  } = UseTable(columns, saveKey);

  return (
    <div className="react-ant-table">
      <Row className="set" justify="end">
        <MyIcon type="icon_edit" onClick={show} />
      </Row>
      <Table
        columns={col.filter((i) => i.hidden !== "hidden")}
        dataSource={dataSource}
        className={
          className
            ? `table-show-container ${className}`
            : "table-show-container"
        }
        {...Props}
      >
        {children}
      </Table>
      <Drawer
        className="table-drawer"
        width={1000}
        onClose={hiddin}
        maskClosable={true}
        visible={showDrawer}
        title="表格显示设置"
      >
        <Table
          columns={tbTitle}
          dataSource={col}
          rowKey="index"
          components={{
            body: {
              wrapper: DraggableContainer,
              row: DraggableBodyRow,
            },
          }}
          pagination={false}
        />
        <Row justify="center" className="mt20">
          <Button type="primary" onClick={saveTbSet}>
            保存此表格设置，下次打开默认启用
          </Button>
        </Row>
      </Drawer>
    </div>
  );
}
export default MyTable;
