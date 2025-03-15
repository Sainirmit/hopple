const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function resetDB() {
  try {
    console.log("Deleting all records...");

    // Delete in order of dependencies
    await prisma.subtask.deleteMany({});
    console.log("- Subtasks deleted");

    await prisma.task.deleteMany({});
    console.log("- Tasks deleted");

    await prisma.projectMember.deleteMany({});
    console.log("- Project members deleted");

    await prisma.project.deleteMany({});
    console.log("- Projects deleted");

    await prisma.user.deleteMany({});
    console.log("- Users deleted");

    console.log("Database reset complete!");
  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDB();
