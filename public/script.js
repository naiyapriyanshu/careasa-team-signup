document.getElementById("teamForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", fullName.value);
    formData.append("email", email.value);
    formData.append("phone", phone.value);
    formData.append("dob", dob.value);
    formData.append("department", department.value);
    formData.append("address", address.value);
    formData.append("agreement", agreement.files[0]);

    const res = await fetch("/team-signup", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    alert(data.message);
});
