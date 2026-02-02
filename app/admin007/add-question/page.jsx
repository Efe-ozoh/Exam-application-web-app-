import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddQuestionClient from "./AddQuestionClient";

const AddQuestionPage = async () => {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth");

  if (!isAdmin) {
    redirect("/admin007/login");
  }

  return <AddQuestionClient />;
};

export default AddQuestionPage;