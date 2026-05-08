

interface SimilarityScoreProps {
    score: number
}


export const SimilarityScore = ({score} : SimilarityScoreProps) => {
    return (
        <>
            <div className={`w-8  flex justify-center items-center rounded-md ${score > 70 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : score > 30 ? 'bg-red-500' : undefined}`}>
                {score}
            </div>
        </>
    )
}