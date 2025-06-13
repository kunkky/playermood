import { useParams } from "react-router-dom";

const ParticularTraining = () => {
  const { id } = useParams();

  return <div>Training Session ID: {id}</div>;
};

export default ParticularTraining;
