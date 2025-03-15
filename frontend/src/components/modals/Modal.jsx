
const Modal = ({ content, open, setOpen, reset=()=>{} }) => {
  const close = () => {
    reset()
    setOpen(false)
  }
  const handleClick = e => {
    if (e.target?.attributes?.class?.value === "modal__background") {
      close()
    }
  }
  if (!open) return null
  return <div className="modal__background" onClick={handleClick}>
      <div className="modal__content-box">
        <span 
          className="close"
          onClick={() => close()}
          >
          &times; 
        </span>
        <div className="modal__content">
          { content }
        </div>
      </div>
  </div>
}

export default Modal