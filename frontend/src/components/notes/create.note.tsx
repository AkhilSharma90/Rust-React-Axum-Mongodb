import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../LoadingButton";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoteFn } from "../../api/noteApi";
import NProgress from "nprogress";

type ICreateNoteProps = {
  setOpenNoteModal: (open: boolean) => void;
};

const createNoteSchema = object({
  title: string().min(1, "Title is required"),
  content: string().min(1, "Content is required"),
});

export type CreateNoteInput = TypeOf<typeof createNoteSchema>;

const CreateNote: FC<ICreateNoteProps> = ({ setOpenNoteModal }) => {
  const methods = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const queryClient = useQueryClient();

  const { mutate: createNote } = useMutation({
    mutationFn: (note: CreateNoteInput) => createNoteFn(note),
    onMutate() {
      NProgress.start();
    },
    onSuccess(data) {
      queryClient.invalidateQueries(["getNotes"]);
      setOpenNoteModal(false);
      NProgress.done();
      toast("Note created successfully", {
        type: "success",
        position: "top-right",
      });
    },
    onError(error: any) {
      setOpenNoteModal(false);
      NProgress.done();
      const resMessage =
        error.response.data.message ||
        error.response.data.detail ||
        error.message ||
        error.toString();
      toast(resMessage, {
        type: "error",
        position: "top-right",
      });
    },
  });

  const onSubmitHandler: SubmitHandler<CreateNoteInput> = async (data) => {
    createNote(data);
  };
  return (
    <section>
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
        <h2 className="text-2xl text-ct-dark-600 font-semibold">Create Note</h2>
        <div
          onClick={() => setOpenNoteModal(false)}
          className="text-2xl text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center cursor-pointer"
        >
          <i className="bx bx-x"></i>
        </div>
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Title
          </label>
          <input
            className={twMerge(
              `appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 mb-2  leading-tight focus:outline-none`,
              `${errors["title"] && "border-red-500"}`
            )}
            {...methods.register("title")}
          />
          <p
            className={twMerge(
              `text-red-500 text-xs italic mb-2 invisible`,
              `${errors["title"] && "visible"}`
            )}
          >
            {errors["title"]?.message as string}
          </p>
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Content
          </label>
          <textarea
            className={twMerge(
              `appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
              `${errors.content && "border-red-500"}`
            )}
            rows={6}
            {...register("content")}
          />
          <p
            className={twMerge(
              `text-red-500 text-xs italic mb-2`,
              `${errors.content ? "visible" : "invisible"}`
            )}
          >
            {errors.content && errors.content.message}
          </p>
        </div>
        <LoadingButton loading={false}>Create Note</LoadingButton>
      </form>
    </section>
  );
};

export default CreateNote;
