import { PulseLoader } from "react-spinners"

const SCPList = ({ scp, title, scp2, title2 }) => {
  if (!scp) return <PulseLoader />
  return <div className="card__display-box" style={{ display: 'flex', justifyContent: 'center'}}>
    <div >
      <table>
        <thead>
          <tr><th></th><th>{title}</th>{scp2 && <th>{title2}</th>}</tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Project Management:</b></td><td>{scp.PM}</td>{scp2&&<td>{scp2.PM}</td>}
          </tr>
          <tr>
            <td><b>Data Engineering:</b></td><td>{scp.DE}</td>{scp2&&<td>{scp2.DE}</td>}
          </tr>
          <tr>
            <td><b>Software Development:</b></td><td>{scp.SD}</td>{scp2&&<td>{scp2.SD}</td>}
          </tr>
          <tr>
            <td><b>Machine Learning Engineering:</b></td><td>{scp.ML}</td>{scp2&&<td>{scp2.ML}</td>}
          </tr>
          <tr>
            <td><b>UI/UX Design:</b></td><td>{scp.UX}</td>{scp2&&<td>{scp2.UX}</td>}
          </tr>
          <tr>
            <td><b>Business Analysis/Client Interaction:</b></td><td>{scp.BA}</td>{scp2&&<td>{scp2.BA}</td>}
          </tr>
        </tbody>
      </table>
    </div>
  </div>
}


export default SCPList