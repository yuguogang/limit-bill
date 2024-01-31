import { useState } from "react";
// material-ui
import { Snackbar, Alert } from "@mui/material";
import { createRoot } from "react-dom/client";

function Message(props) {
  const { content, duration, type } = { ...props };
  // 开关控制：默认true,调用时会直接打开
  const [open, setOpen] = useState(true);
  // 关闭消息提示
  const handleClose = (event, reason) => {
    setOpen(false);
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={handleClose}
      sx={{
        maxWidth:"390px",
        "& .MuiPaper-root":{
        maxWidth:"390px",

        }
      }}
    >
      <Alert severity={type} variant="standard">
        {content}
      </Alert>
    </Snackbar>
  );
}

const message = {
  dom: null,
  // success({ content, duration = 1500 }) {
  success(content,{duration}={}) {
    // 创建一个dom
    this.dom = document.createElement("div");
    // 定义组件，
    const JSXdom = (
      <Message content={content} duration={duration} type="success"></Message>
    );
    // 渲染DOM
    createRoot(this.dom).render(JSXdom);
    // 置入到body节点下
    document.body.appendChild(this.dom);
  },
  // error({ content, duration }) {
  error(content,{duration }={}) {
    this.dom = document.createElement("div");
    const JSXdom = (
      <Message content={content} duration={duration} type="error"></Message>
    );
    createRoot(this.dom).render(JSXdom);
    document.body.appendChild(this.dom);
  },
  warning(content,{duration }={}) {
    this.dom = document.createElement("div");
    const JSXdom = (
      <Message content={content} duration={duration} type="warning"></Message>
    );
    createRoot(this.dom).render(JSXdom);
    document.body.appendChild(this.dom);
  },
  info(content,{duration }={}) {
    this.dom = document.createElement("div");
    const JSXdom = (
      <Message content={content} duration={duration} type="warning"></Message>
    );
    createRoot(this.dom).render(JSXdom);
    document.body.appendChild(this.dom);
  },
     
};

export default message;
