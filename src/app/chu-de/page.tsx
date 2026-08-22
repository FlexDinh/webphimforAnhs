import topic from "@/data/phimhay";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
interface ITopic {
  topic: string;
  topicDirect: string;
  color: string;
}
export default function Topic() {
  return (
    <div className="container py-[160px] px-[50px] max-[1250px]:px-[20px] max-[750px]:px-[12px] max-w-full bg-[#0A0C14] min-h-screen">
      <div>
        <h1 className="text-[28px] mb-[20px] leading-[1.4] font-bold cinema-heading-xl tracking-[-0.02em]">
          Các chủ đề
        </h1>
      </div>
      <div className="grid max-[1600px]:grid-cols-6 max-[1120px]:grid-cols-5 max-[970px]:grid-cols-4 max-[800px]:grid-cols-3 grid-cols-7 gap-4">
        {topic.Topic.map((item: ITopic, key) => (
          <a
            key={key}
            className="p-[20px] min-h-[145px] max-[650px]:min-h-[100px] flex flex-col items-start justify-end max-[650px]:justify-center cursor-pointer rounded-[14px] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] border border-white/6"
            style={{ backgroundColor: item.color }}
          >
            <h1 className="text-[28px] max-[1400px]:text-[20px] max-[650px]:text-[17px] max-[650px]:pb-0 pb-[12px] whitespace-normal font-bold leading-[1.3]">
              {item.topic}
            </h1>
            <span className="text-[13px] max-[650px]:hidden flex items-center text-white/80">
              Xem toàn bộ
              <FontAwesomeIcon
                icon={faAngleRight}
                style={{ fontSize: "13px", paddingLeft: "5px" }}
              />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

