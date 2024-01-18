class ViewProfil extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <main class="profile-container">

            <section class="profile-header">
                <h1>Edit profile</h1>
                <button class="avatar-button">Change avatar</button>
            </section>

            <form class="profile-form">
            
                <div class="form-group">
                    <label for="first-name">First Name</label>
                    <input type="text" id="first-name" value="">
                </div>
                <div class="form-group">
                    <label for="last-name">Last Name</label>
                    <input type="text" id="last-name" value="">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" value="">
                </div>
                <div class="form-actions">
                    <button type="cancel-button" class="cancel-button">Annuler</button>
                    <button type="submit" class="save-button">Sauvegarder</button>
                </div>
            </form>
        </main>
        `;

        const cancelButton = this.querySelector('.cancel-button');
        const profileForm = this.querySelector('.profile-form');
    
        cancelButton.addEventListener('click', () => {
            profileForm.reset(); // Réinitialise le formulaire
        });
    
        profileForm.addEventListener('submit', this.saveProfile);
    }
    
    saveProfile(event) {
        event.preventDefault();

        const firstName = this.querySelector('#first-name').value;
        const lastName = this.querySelector('#last-name').value;
        const email = this.querySelector('#email').value;
        const password = this.querySelector('#password').value;

        //Tests
        console.log('First Name:', firstName);
        console.log('Last Name:', lastName);
        console.log('Email:', email);
        console.log('Password:', password);

        // Ici, vous pouvez appeler la méthode fetch pour envoyer les données
        // à votre serveur
        // fetch('/path_to_your_server_endpoint', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         firstName: firstName,
        //         lastName: lastName,
        //         email: email,
        //         password: password
        //     })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // Traiter la réponse ici
        //     console.log('Success:', data);
        // })
        // .catch((error) => {
        //     console.error('Error:', error);
        // });

    }
}

customElements.define('view-profil', ViewProfil);
