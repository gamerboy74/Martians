import React from 'react';

interface StreamSchedule {
  day: string;
  time: string;
  game: string;
  isStreaming: boolean;
}

const schedule: StreamSchedule[] = [
  { day: "MONDAY", time: "7:00PM - 4:00AM CET", game: "VANILLA MASTERS 2019", isStreaming: true },
  { day: "TUESDAY", time: "9:00PM - 6:00AM CET", game: "DARK SOULS NO-HIT SPEED RUN", isStreaming: true },
  { day: "WEDNESDAY", time: "NOT STREAMING", game: "", isStreaming: false },
  { day: "THURSDAY", time: "7:00PM - 4:00AM CET", game: "HEARTHSTONE", isStreaming: true },
  { day: "FRIDAY", time: "7:00PM - 4:00AM CET", game: "FORTNITE", isStreaming: true },
  { day: "SATURDAY", time: "NOT STREAMING", game: "", isStreaming: false },
  { day: "SUNDAY", time: "7:00PM - 4:00AM CET", game: "DOTA 2", isStreaming: true }
];

const TimetableSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-transparent px-8 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-16">
          <span className="text-gray-400 text-sm tracking-wider">#WEAREGAMERS</span>
          <h2 className="text-5xl font-bold text-white mt-4">
            TIMETABLE FOR<br />
            THE TOURNAMENTS
          </h2>
        </div>

        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div
              key={item.day}
              className={`relative overflow-hidden ${
                item.isStreaming ? 'bg-purple-900/20' : 'bg-gray-900/20'
              } backdrop-blur-sm rounded-lg transition-all duration-300 hover:bg-purple-900/30`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-50" />
              <div className="relative p-6 flex items-center justify-between">
                <div className="w-48">
                  <span className={`text-lg font-medium ${
                    item.isStreaming ? 'text-white' : 'text-purple-400'
                  }`}>
                    {item.day}
                  </span>
                </div>
                
                <div className="flex-1 text-center">
                  <span className={`text-xl ${
                    item.isStreaming ? 'text-white' : 'text-purple-400'
                  }`}>
                    {item.time}
                  </span>
                </div>
                
                <div className="w-96 text-right">
                  <span className={`text-lg font-medium ${
                    item.isStreaming ? 'text-white' : 'text-purple-400'
                  }`}>
                    {item.game}
                  </span>
                </div>

                {item.isStreaming && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-purple-400 to-purple-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimetableSection;