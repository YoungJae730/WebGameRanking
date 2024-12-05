import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage({ user }) {
    const apiUrl = process.env.REACT_APP_API_ENDPOINT_URL;
    const navigate = useNavigate();

    const handleMain = () => {
        navigate('/');
    }

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // 이미지 미리보기 URL 생성
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
          setImage(file);
        }
    }

    const handleChangeProfile = async (e) => {
        e.preventDefault();

        if (!image) {
          alert('이미지를 선택해 주세요.');
          return;
        }
    
        const formData = new FormData();
        formData.append('profilePicture', image);
        formData.append('email', user.email);
    
        try {
          const response = await fetch(apiUrl + '/api/changeProfile', {
            method: 'POST',
            body: {formData},
          });
    
          const data = await response.json();
          if (response.ok) {
            alert('프로필 이미지가 저장되었습니다.');
          } else {
            alert('이미지 업로드 실패: ' + data.message);
          }
        } catch (error) {
          console.error('서버와 연결 실패:', error);
          alert('서버와 연결하는 중에 문제가 발생했습니다.');
        }
    }

    return ( user ? 
        <div className="profile-page-container">
            <div className="profile-page-section">
            <p onClick={handleMain} style={{cursor:'pointer', fontSize:'30px'}}>{'<'}</p>
                <div className="profile-image-section">
                    <p>프로필 이미지 변경</p><br/>
                    <div className="profile-picture">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        ) : (
                            <p></p>
                        )}</div>
                    <form onSubmit={handleChangeProfile}>
                        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} />
                        <button className="login-button" type="submit">저장</button>
                    </form>
                </div>
                <div className="profile-info-section">
                    <div>
                        <p><strong>이메일</strong></p><br/>
                        <p>{user.email}</p>
                    </div>
                    <br />
                    <div>
                        <p><strong>닉네임</strong></p><br/>
                        <p>{user.name}</p>
                    </div>
                    <br />
                </div>
            </div>
        </div>
    : <></>);
}
export default ProfilePage;