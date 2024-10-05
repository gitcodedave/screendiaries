import { useState, useRef, useEffect } from "react"
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import Navbar from "../components/navbar";
import { Link } from "react-router-dom";

const EditProfilePage = () => {
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [bioState, setBioState] = useState('')
    const [profileBio, setProfileBio] = useState('')
    const [profileFirstName, setProfileFirstName] = useState('')
    const [profileLastName, setProfileLastName] = useState('')
    const [firstNameState, setFirstNameState] = useState('')
    const [lastNameState, setLastNameState] = useState('')
    const [errorMessage, setErrorMessageState] = useState('')
    const [previewProfilePic, setPreviewProfilePic] = useState('')
    const profilePictureInputRef = useRef();
    const [cookies] = useCookies(['profileID', 'AccessToken']);

    const getProfileData = async () => {
        try {
            const response = await API.get(`network/userprofiles/${cookies.profileID}/`, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            const data = response.data;
            setProfileBio(data.bio)
            setProfileFirstName(data.first_name)
            setProfileLastName(data.last_name)
        } catch (error) {
            setErrorMessageState('Error getting profile data')
        }
    }

    useEffect(() => {
        getProfileData()
    },);

    const handleProfilePictureFileChange = (event) => {
        const file = event.target.files[0];
        setProfilePictureFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewProfilePic(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleProfilePicSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        if (profilePictureFile != null) {
            formData.append('profile_picture', profilePictureFile);
        } else {
            setErrorMessageState('(Please choose an image file)')
            return;
        }
        try {
            const response = await API.patch(`network/userprofiles/${cookies.profileID}/`, formData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            profilePictureInputRef.current.reset()
            setProfilePictureFile(null);
            setPreviewProfilePic('');
            setErrorMessageState('Profile Image Updated!')
            return response;
        } catch (error) {
            setErrorMessageState('Error uploading image')
        }
    };

    const handleFormDataSubmit = async (event) => {
        event.preventDefault()
        const credentials = {}

        if (bioState !== '') {
            credentials.bio = bioState
        }
        if (firstNameState !== '') {
            credentials.first_name = firstNameState
        }
        if (lastNameState !== '') {
            credentials.last_name = lastNameState
        }

        if (bioState === '' && firstNameState === '' && lastNameState === '') {
            setErrorMessageState('Please update fields')
            return;
        }
        const successfulUpdate = await API.put(`network/userprofiles/${cookies.profileID}/`, credentials, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `JWT ${cookies.AccessToken}`
            }
        })
        if (successfulUpdate.response) {
            setErrorMessageState('Oops! Something went wrong.')
        }
        setErrorMessageState('Profile updated')
        setBioState('')
        setFirstNameState('')
        setLastNameState('')
        let allForms = document.querySelectorAll('input');
        allForms.forEach(eachInput => eachInput.value = '');
        return;
    }

    return (
        <div>
            <Navbar />
            <Link to={'/profile'}>Back</Link>
            <div className='loginbox'>
                <div style={{ display: 'flex', flex: 'column', justifyContent: 'center' }}>
                    {previewProfilePic && <img src={previewProfilePic} alt="Selected Preview" style={{ marginTop: '10px', maxWidth: '50%' }} />}
                    <form onSubmit={handleProfilePicSubmit} ref={profilePictureInputRef}>
                        <input
                            id='profile-pic-box'
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureFileChange}
                        />
                        <button className='loginbutton' id='upload-button' type="submit">Upload</button>
                    </form>
                </div>
                <div>
                    <form onSubmit={handleFormDataSubmit} className='loginitems'>
                        {errorMessage}
                        <table>
                            <tbody>
                                <tr>
                                    <td>{profileBio}</td>
                                    <td>{<input
                                        id='bio-box'
                                        className='loginitem'
                                        type="text"
                                        value={bioState}
                                        onChange={(e) => setBioState(e.target.value)}
                                        placeholder="(profile bio)"
                                    />}</td>
                                </tr>
                                <tr>
                                    <td>{profileFirstName}</td>
                                    <td>{<input
                                        id='first-name-box'
                                        className='loginitem'
                                        type="text"
                                        value={firstNameState}
                                        onChange={(e) => setFirstNameState(e.target.value)}
                                        placeholder="(first name)"
                                    />}</td>
                                </tr>
                                <tr>
                                    <td>{profileLastName}</td>
                                    <td>{<input
                                        id='last-name-box'
                                        className='loginitem'
                                        type="text"
                                        value={lastNameState}
                                        onChange={(e) => setLastNameState(e.target.value)}
                                        placeholder="(last name)"
                                    />}</td>
                                </tr>
                            </tbody>
                        </table>
                        <button className='loginbutton' id='submit-button' type="submit">Submit</button>
                    </form>
                </div>

            </div>
        </div>
    )

}

export default EditProfilePage;