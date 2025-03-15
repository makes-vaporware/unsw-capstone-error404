import { useNavigate } from 'react-router-dom'
import logoNoBackground from '../assets/logo-no-background.svg'
import { useState } from 'react'

const Public = () => {
  const navigate = useNavigate()

  const content = <>
    <div className="dark-mode" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button 
        onClick={ () => navigate('/login') } 
        name="button-go-to-login"> 
        Go To Log In
      </button>
      <p/>
      <img src={logoNoBackground} alt="AlignEd Logo" width="500px" height="500px"/>
    </div>
  </>
  return content
}

export default Public