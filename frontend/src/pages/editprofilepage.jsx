

const EditProfilePage = () => {


    const data = [
        { name: "First Name",  },
        { name: "Last Name" },
        { name: "Username" },
        { name: "Bio" },
        { name: "Profile Picture" },
        { name: "Cover Picture" },
        { name: "Username" },
    ]


    return(
        <div>
            <div className="App">
            <table>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                </tr>
                {data.map((obj, i) => {
                    
                    return (
                        <tr key={i}>
                            <td>{obj.name}</td>
                            <td>{<input/>}</td>
                        </tr>
                    )
                })}
            </table>
        </div>
        </div>

    )

}

export default EditProfilePage;