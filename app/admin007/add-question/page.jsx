import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  isValidAdminSessionToken,
} from "@/lib/auth/admin-session";
import AddQuestionClient from "./AddQuestionClient";

const AddQuestionPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSessionToken(token)) {
    redirect("/admin007/login");
  }

  return <AddQuestionClient />;
};

export default AddQuestionPage;