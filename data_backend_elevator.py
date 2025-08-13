# Bakend solution to elevator problem that simulates movement of the elevator and added 
# extra non numerical floors, like 'party terrace' yay!

# copy in to online repl to try... or preferred env.
# tested on python 3.10

from dataclasses import dataclass, field

LOBBY = "Lobby"
PARTY_TERRACE = "Party Terrace"

def normalize_floor_name(name: str, floors: list[str]) -> str:
    s = name.strip().lower()
    aliases = {
        "l": LOBBY, "g": LOBBY, "ground": LOBBY, "lobby": LOBBY,
        "pt": PARTY_TERRACE, "party": PARTY_TERRACE, "terrace": PARTY_TERRACE,
        "party terrace": PARTY_TERRACE
    }
    # direct match (case-insensitive)
    for f in floors:
        if s == f.lower():
            return f
    # aliases
    if s in aliases:
        return aliases[s]
    raise ValueError(f"Unknown floor: {name}")

def dir_symbol(d: int) -> str:
    return "↑" if d > 0 else ("↓" if d < 0 else "•")

@dataclass
class Elevator:
    floors: list[str]
    current_idx: int = 0  # starts at Lobby (index 0 after we build floors)
    requests: set[int] = field(default_factory=set)
    direction: int = 0  # -1 down, 0 idle, +1 up
    door_open: bool = False

    def floor_name(self, idx: int) -> str:
        return self.floors[idx]

    def idx_of(self, floor_name: str) -> int:
        return self.floors.index(floor_name)

    def add_request(self, floor_name: str):
        idx = self.idx_of(normalize_floor_name(floor_name, self.floors))
        if idx == self.current_idx and self.door_open:
            return
        self.requests.add(idx)
        print(f"Request registered for {self.floor_name(idx)}")

    def _nearest_request_idx(self) -> int | None:
        if not self.requests:
            return None
        return min(self.requests, key=lambda i: abs(i - self.current_idx))

    def _set_direction_towards(self, target_idx: int):
        self.direction = 1 if target_idx > self.current_idx else (-1 if target_idx < self.current_idx else 0)

    def _open_doors(self):
        self.door_open = True
        print(f"Doors open at {self.floor_name(self.current_idx)}")

    def _close_doors(self):
        self.door_open = False
        print("Doors closed")

    def step(self):
        if not self.requests:
            if self.door_open:
                self._close_doors()
            self.direction = 0
            print(f"Idle at {self.floor_name(self.current_idx)} {dir_symbol(self.direction)}")
            return

        target = self._nearest_request_idx()
        self._set_direction_towards(target)

        if self.current_idx == target:
            if not self.door_open:
                self._open_doors()
            print(f"Serving {self.floor_name(self.current_idx)}")
            self.requests.discard(target)
            self._close_doors()
            self.direction = 0 if not self.requests else self.direction
            return

        if self.door_open:
            self._close_doors()

        self.current_idx += self.direction
        print(f"Moving {dir_symbol(self.direction)} to {self.floor_name(self.current_idx)}")

        if self.current_idx in self.requests:
            self._open_doors()
            print(f"Arrived at {self.floor_name(self.current_idx)}")
            self.requests.discard(self.current_idx)
            self._close_doors()

    def status(self):
        pending = [self.floor_name(i) for i in sorted(self.requests)]
        return {
            "current_floor": self.floor_name(self.current_idx),
            "direction": {1: "up", -1: "down", 0: "idle"}[self.direction],
            "door_open": self.door_open,
            "pending_stops": pending,
        }

def repl():
    # Ask how many floors to add between Lobby and Party Terrace
    while True:
        try:
            n = int(input("How many floors do you want? ").strip())
            if n < 0:
                print("Please enter 0 or a positive number.")
                continue
            break
        except ValueError:
            print("Please enter a valid integer.")
    floors = [LOBBY] + [str(i) for i in range(1, n + 1)] + [PARTY_TERRACE]

    e = Elevator(floors=floors, current_idx=0)  # start at Lobby
    print("Elevator simulation started. Type 'help' for commands.")
    print(f"Floors: {', '.join(floors)} (Lobby and Party Terrace included)")

    while True:
        try:
            cmd = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break
        if not cmd:
            continue

        parts = cmd.split()
        action = parts[0].lower()

        try:
            if action in ("help", "h", "?"):
                print("Commands:")
                print("  call <floor>   - hall call (e.g., call Lobby, call 2, call Party Terrace)")
                print("  go <floor>     - select a destination inside the car")
                print("  tick [n]       - progress the simulation by n steps (default 1)")
                print("  status         - show elevator status")
                print("  floors         - list floors")
                print("  quit           - exit")
            elif action == "floors":
                print(", ".join(e.floors))
            elif action == "status":
                s = e.status()
                print(f"At {s['current_floor']} {dir_symbol({'up':1,'down':-1,'idle':0}[s['direction']])} | Door: {'open' if s['door_open'] else 'closed'}")
                print("Pending:", ", ".join(s["pending_stops"]) if s["pending_stops"] else "none")
            elif action == "call" and len(parts) > 1:
                e.add_request(" ".join(parts[1:]))
            elif action == "go" and len(parts) > 1:
                e.add_request(" ".join(parts[1:]))
            elif action == "tick":
                n = int(parts[1]) if len(parts) > 1 else 1
                for _ in range(max(1, n)):
                    e.step()
            elif action in ("quit", "exit"):
                print("Goodbye!")
                break
            else:
                print("Unknown command. Type 'help' for usage.")
        except Exception as ex:
            print(f"Error: {ex}")

if __name__ == "__main__":
    repl()