import React from 'react';
import { ServiceCard } from "./card";
import { homeContent } from "./examList";

const Services = () => {
  return (
    <div
      className="
        flex flex-col lg:flex-row
        gap-4 px-4
        lg:overflow-x-auto
        lg:snap-x lg:snap-mandatory
        hide-scrollbar
        my-6
      "
    >
      {homeContent.map((content, id) => (
        <div
          key={id}
          className="lg:snap-start flex-shrink-0"
        >
          <ServiceCard
            title={content.title}
            description={content.description}
            image={content.image}
            url={content.url}
          />
        </div>
      ))}
    </div>
  );
};

export default Services;
