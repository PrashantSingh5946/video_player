const Modal = (props) =>
{
    
    return (

        <div className="modal">

                 <div className="form">
                        <input type="text" tabIndex="0" placeholder="Name" onChange={(e)=> {localStorage.setItem('name',e.target.value)}}></input>

                        <input type="submit" value="Continue" onClick={()=> { props.close(false)}}></input>
                 </div>
        </div>
    )
}

export default Modal;

