import { Skeleton, Box } from "@mui/material";

const QuestionPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 mt-12 pt-20">
      
      {/* HEADER */}
      <Box className="max-w-4xl mx-auto mb-6">
        <Skeleton variant="text" width="40%" height={35} />
      </Box>

      {/* Calculator + Timer */}
      <Box className="flex items-center justify-between w-full px-3 pb-4">
        <Skeleton variant="rounded" width={40} height={40} />
        <Skeleton variant="rounded" width={80} height={32} />
      </Box>

      {/* QUESTION AREA */}
      <Box className="max-w-4xl mx-auto mt-6 space-y-6">

        {/* Question number */}
        <Skeleton variant="text" width="30%" height={28} />

        {/* Question text */}
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" width="80%" height={24} />

        {/* Options */}
        {[1, 2, 3, 4].map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={50}
            className="mb-3"
          />
        ))}

        {/* Nav buttons */}
        <Box className="flex justify-between mt-12">
          <Skeleton variant="rounded" width={120} height={44} />
          <Skeleton variant="rounded" width={120} height={44} />
        </Box>

        {/* Submit button */}
        <Box className="text-center mt-10">
          <Skeleton variant="rounded" width={160} height={45} className="mx-auto" />
        </Box>
      </Box>
    </div>
  );
};

export default QuestionPageSkeleton;
