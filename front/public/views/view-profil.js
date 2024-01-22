// class ViewProfil extends HTMLElement {
//     connectedCallback() {
//         this.innerHTML = `
//       <main class="profile-container">

//         <section class="profile-header">
//             <h1>Edit profile</h1>
//             <button class="avatar-button">Change avatar</button>
//         </section>

//         <form class="profile-form">
        
//             <div class="form-group">
//                 <label for="first-name">First Name</label>
//                 <input type="text" id="first-name" value="toto">
//             </div>
//             <div class="form-group">
//                 <label for="last-name">Last Name</label>
//                 <input type="text" id="last-name" value="toto">
//             </div>
//             <div class="form-group">
//                 <label for="email">Email</label>
//                 <input type="email" id="email" value="toto@gmail.com">
//             </div>
//             <div class="form-group">
//                 <label for="password">Password</label>
//                 <input type="password" id="password" value="sdbfbnd65sfdvb s">
//             </div>
//             <div class="form-actions">
//                 <button type="button" class="cancel-button">Cancel</button>
//                 <button type="submit" class="save-button">Save</button>
//             </div>
//         </form>
//       </main>
//     `;
//     }
// }
  
//   customElements.define('view-profil', ViewProfil);

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
                    <input type="text" id="first-name" value="toto">
                </div>
                <div class="form-group">
                    <label for="last-name">Last Name</label>
                    <input type="text" id="last-name" value="toto">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="toto@gmail.com">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" value="sdbfbnd65sfdvb s">
                </div>
                <div class="form-actions">
                    <button type="button" class="cancel-button">Cancel</button>
                    <button type="submit" class="save-button">Save</button>
                </div>
            </form>
        </main>
        `;
    }
}

customElements.define('view-profil', ViewProfil);
