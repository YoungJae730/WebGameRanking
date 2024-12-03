import React from "react";

function ProfilePage() {
    return (
        <div className="profile-page-container">
            <div className="profile-page-section">
                <div className="profile-image-section">
                    <p>프로필 이미지 변경</p><br/>
                    <div className="profile-picture">{}</div>
                    <form>
                        <input type="file" accept="image/png, image/jpeg, image/jpg" />
                    </form>
                </div>
                <div className="profile-info-section">
                    <div>
                        <p>이메일</p><br/>
                        <input disabled></input>
                    </div>
                    <br />
                    <div>
                        <p>닉네임</p><br/>
                        <input></input>
                    </div>
                    <br />
                    <div>
                        <p>현재 비밀번호</p><br/>
                        <input></input>
                    </div>
                    <br />
                    <div>
                        <p>새 비밀번호</p><br/>
                        <input></input>
                    </div>
                    <br />
                    <button className="login-button" type="">저장</button>
                </div>
            </div>
        </div>
    );
}
export default ProfilePage;