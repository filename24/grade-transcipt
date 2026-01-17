# Knea - Grade Transcript

[Монгол хувилбар (Mongolian Version)](./README.mn.md)

**Knea - Grade Transcript** is a web application designed to help Mongolian students view and manage their academic records. It securely connects to the official Mongolian Ministry of Education's ESIS API to fetch and display grade information in a user-friendly dashboard.

## Features

*   **Secure ESIS Integration:** Securely fetches student grade data using ESIS API.
*   **Interactive Dashboard:** View your grades, GPA, and academic progress through an intuitive and visual dashboard.
*   **Historical Data:** Track your academic performance over different semesters.
*   **Modern & Responsive UI:** Access your grades on any device, whether it's a desktop, tablet, or smartphone.
*   **Dark Mode:** Switch between light and dark themes for comfortable viewing.

---

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Monorepo:** [Turborepo](https://turbo.build/) & [pnpm](https://pnpm.io/)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **UI:** [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Code Quality:** [BiomeJS](https://biomejs.dev/) for linting and formatting.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or newer)
*   [pnpm](https://pnpm.io/installation)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/grade-transcript.git
    cd grade-transcript
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the `apps/web` directory and add the necessary environment variables for the ESIS API.
    ```env
    ESIS_API_KEY=your_api_key
    DATABASE_URL="your_database_url"
    ```

4.  **Run the database migrations:**
    ```bash
    pnpm db:push
    ```

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Structure

This project is a monorepo using pnpm workspaces.

*   `apps/web`: The main Next.js web application.
*   `packages/database`: Prisma schema and database client.
*   `packages/esis`: Shared library for interacting with the Mongolian ESIS API.
*   `packages/tsconfig`: Shared TypeScript configurations.



---

## License

This project is licensed under the MIT License.
