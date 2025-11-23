# Maharashtra Teacher Attendance App

An offline-capable attendance mini-app for teachers in Maharashtra schools to mark student attendance and meal attendance with seamless online/offline synchronization.

## Features

- **Teacher Authentication**: Secure login with 8-digit Teacher ID
- **School Verification**: UDISE-based school validation
- **Class Management**: Download and manage multiple class rosters
- **Student Attendance**: Quick and intuitive attendance marking
- **Meal Attendance**: Separate meal tracking for students
- **Offline-First**: Works seamlessly without internet connection
- **Auto-Sync**: Automatically uploads pending data when online
- **Mobile-Optimized**: Designed for mobile devices with touch-friendly interface

## Demo Credentials

Use these credentials to test the application:

- **Teacher ID**: `12345678`
- **UDISE Code**: `27251234567`

## How to Use

1. **Login**: Enter your 8-digit Teacher ID
2. **Confirm Details**: Verify your teacher information
3. **School Verification**: Enter your 11-digit UDISE code
4. **Confirm School**: Verify school details
5. **Home Page**: View and download your class rosters
6. **Mark Attendance**: 
   - Expand a class to see options
   - Tap on students to toggle their attendance status
   - Submit or discard changes
7. **Offline Mode**: App automatically detects connectivity and works offline
8. **Sync**: Pending submissions automatically upload when online

**URL**: https://lovable.dev/projects/5128e53d-3da2-4fb5-a891-3892f705181b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5128e53d-3da2-4fb5-a891-3892f705181b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5128e53d-3da2-4fb5-a891-3892f705181b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
